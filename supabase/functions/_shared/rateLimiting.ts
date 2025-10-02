/**
 * Rate Limiting Utilities for Edge Functions
 * Implements per-user rate limiting with Redis-like in-memory storage
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit storage (persists during function instance lifetime)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // seconds until reset
}

/**
 * Check rate limit for a user
 */
export function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${userId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or expired
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    };
  }

  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Rate limit configurations by endpoint type
 */
export const RATE_LIMITS = {
  // AI analysis endpoints - more restrictive
  AI_ANALYSIS: {
    maxRequests: 10, // 10 requests
    windowMs: 60 * 1000 // per minute
  },
  
  // Data fetch endpoints - moderate
  DATA_FETCH: {
    maxRequests: 30, // 30 requests
    windowMs: 60 * 1000 // per minute
  },
  
  // Standard operations - lenient
  STANDARD: {
    maxRequests: 60, // 60 requests
    windowMs: 60 * 1000 // per minute
  }
};

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.allowed ? 
      String(result.remaining + (result.allowed ? 1 : 0)) : '0',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {})
  };
}

/**
 * Verify request signature for tamper protection
 */
export async function verifyRequestSignature(
  payload: any,
  timestamp: number,
  signature: string,
  secret: string
): Promise<boolean> {
  // Check timestamp is within 5 minute window
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (Math.abs(now - timestamp) > fiveMinutes) {
    console.error('Request timestamp outside acceptable window');
    return false;
  }

  // Generate expected signature
  const message = JSON.stringify({ payload, timestamp });
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const expectedSignatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  
  const expectedSignature = Array.from(new Uint8Array(expectedSignatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

/**
 * Sanitize sensitive data from logs
 * CRITICAL: Prevent logging of passwords, tokens, email content
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password', 'token', 'secret', 'authorization', 'auth',
    'api_key', 'apikey', 'access_token', 'refresh_token',
    'credit_card', 'ssn', 'email_content', 'body', 'content'
  ];

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    // Redact sensitive fields
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } 
    // Recursively sanitize nested objects
    else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}
