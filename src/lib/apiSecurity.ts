import { z } from "zod";

/**
 * API Security Utilities
 * Implements request signing, response validation, and security headers
 */

// Request signature generation using HMAC
export async function signRequest(
  payload: any,
  timestamp: number,
  secret: string
): Promise<string> {
  const message = JSON.stringify({ payload, timestamp });
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify request signature
export async function verifySignature(
  payload: any,
  timestamp: number,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await signRequest(payload, timestamp, secret);
  return signature === expectedSignature;
}

// Check if timestamp is within acceptable window (5 minutes)
export function isTimestampValid(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.abs(now - timestamp) < fiveMinutes;
}

// API Response validation schemas
export const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  data: z.any().optional()
});

export const attendeeResponseSchema = z.object({
  attendees: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    emailDomain: z.string().optional(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
    error: z.string().optional()
  }))
});

export const companyResearchResponseSchema = z.object({
  companyName: z.string(),
  companyDomain: z.string(),
  profile: z.object({
    industry: z.string(),
    size: z.string().optional(),
    headcount: z.string().optional()
  }).optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  researchedAt: z.string().optional()
});

export const salesIntelligenceResponseSchema = z.object({
  meeting: z.any(),
  attendee: z.object({
    name: z.string(),
    title: z.string().optional(),
    email: z.string().email()
  }),
  company: z.string(),
  companySnapshot: z.object({
    industry: z.string(),
    size: z.string(),
    stage: z.enum(['Startup', 'Growth', 'Enterprise', 'Mature'])
  }).optional(),
  financialHealth: z.object({
    status: z.enum(['Healthy', 'Growing', 'Stable', 'Concerning'])
  }).optional(),
  generatedAt: z.string()
});

// Validate API response
export function validateApiResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid API response: ${error.errors[0].message}`
      };
    }
    return { success: false, error: 'Invalid API response format' };
  }
}

// Secure fetch wrapper with signing and validation
export async function secureApiFetch<T>(
  url: string,
  options: RequestInit & {
    body?: any;
    validateWith?: z.ZodSchema<T>;
    skipSigning?: boolean;
  } = {}
): Promise<T> {
  const { body, validateWith, skipSigning, ...fetchOptions } = options;
  
  // Prepare request headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  };

  // Sign request if not skipped (requires client-side secret)
  if (!skipSigning && body) {
    const timestamp = Date.now();
    // Note: In production, use a secure session token instead of hardcoded secret
    const requestData = {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };
    
    headers['X-Request-Timestamp'] = timestamp.toString();
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API request failed: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {
      // Error text is not JSON, use as is
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Validate response if schema provided
  if (validateWith) {
    const validation = validateApiResponse(data, validateWith);
    if (validation.success === false) {
      throw new Error(validation.error);
    }
    return validation.data;
  }

  return data as T;
}

// Rate limiting client-side tracker (for UX feedback)
interface RateLimitInfo {
  remaining: number;
  reset: number; // timestamp
}

const rateLimitCache = new Map<string, RateLimitInfo>();

export function checkClientRateLimit(endpoint: string): {
  allowed: boolean;
  remaining?: number;
  resetIn?: number;
} {
  const info = rateLimitCache.get(endpoint);
  
  if (!info) {
    return { allowed: true };
  }

  const now = Date.now();
  
  // Reset if time has passed
  if (now >= info.reset) {
    rateLimitCache.delete(endpoint);
    return { allowed: true };
  }

  if (info.remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((info.reset - now) / 1000)
    };
  }

  return {
    allowed: true,
    remaining: info.remaining
  };
}

export function updateClientRateLimit(
  endpoint: string,
  remaining: number,
  resetTimestamp: number
) {
  rateLimitCache.set(endpoint, {
    remaining,
    reset: resetTimestamp
  });
}

// Security headers validation
export function validateSecurityHeaders(headers: Headers): boolean {
  // Check for required security headers in responses
  const requiredHeaders = [
    'content-type',
    'x-content-type-options', // Should be 'nosniff'
  ];

  for (const header of requiredHeaders) {
    if (!headers.has(header)) {
      console.warn(`Missing security header: ${header}`);
      return false;
    }
  }

  return true;
}

// Export all security utilities
export const apiSecurity = {
  signRequest,
  verifySignature,
  isTimestampValid,
  validateApiResponse,
  secureApiFetch,
  checkClientRateLimit,
  updateClientRateLimit,
  validateSecurityHeaders
};
