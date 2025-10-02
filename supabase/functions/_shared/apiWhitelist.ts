/**
 * API Whitelist Configuration
 * Only approved external APIs are allowed
 */

export interface WhitelistedAPI {
  domain: string;
  description: string;
  requiresSSL: boolean;
  allowedMethods?: string[];
}

// Whitelist of approved external APIs
export const APPROVED_APIS: WhitelistedAPI[] = [
  {
    domain: 'ai.gateway.lovable.dev',
    description: 'Lovable AI Gateway',
    requiresSSL: true,
    allowedMethods: ['POST']
  },
  {
    domain: 'www.googleapis.com',
    description: 'Google APIs (Calendar, Gmail)',
    requiresSSL: true,
    allowedMethods: ['GET', 'POST']
  },
  {
    domain: 'oauth2.googleapis.com',
    description: 'Google OAuth',
    requiresSSL: true,
    allowedMethods: ['POST']
  },
  {
    domain: 'www.linkedin.com',
    description: 'LinkedIn API',
    requiresSSL: true,
    allowedMethods: ['GET', 'POST']
  },
  {
    domain: 'api.linkedin.com',
    description: 'LinkedIn REST API',
    requiresSSL: true,
    allowedMethods: ['GET', 'POST']
  }
];

// Private IP ranges that should be blocked
const PRIVATE_IP_RANGES = [
  /^127\./,  // Loopback
  /^10\./,   // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./,  // Private Class B
  /^192\.168\./,  // Private Class C
  /^169\.254\./,  // Link-local
  /^::1$/,  // IPv6 loopback
  /^fe80:/,  // IPv6 link-local
  /^fc00:/,  // IPv6 unique local
];

/**
 * Check if domain is whitelisted
 */
export function isDomainWhitelisted(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    return APPROVED_APIS.some(api => {
      // Allow exact match or subdomain match
      return hostname === api.domain || hostname.endsWith(`.${api.domain}`);
    });
  } catch {
    return false;
  }
}

/**
 * Check if URL uses HTTPS
 */
export function isSecureProtocol(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if IP is in private range (SSRF protection)
 */
export function isPrivateIP(hostname: string): boolean {
  return PRIVATE_IP_RANGES.some(range => range.test(hostname));
}

/**
 * Validate external API request
 */
export function validateExternalRequest(
  url: string,
  method: string = 'GET'
): { allowed: boolean; reason?: string } {
  // Check if URL is valid
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  // Check for private IP (SSRF protection)
  if (isPrivateIP(urlObj.hostname)) {
    return { allowed: false, reason: 'Requests to private IPs are blocked' };
  }

  // Check if domain is whitelisted
  if (!isDomainWhitelisted(url)) {
    return { allowed: false, reason: 'Domain not in approved API whitelist' };
  }

  // Check if HTTPS is required
  const api = APPROVED_APIS.find(a => 
    urlObj.hostname === a.domain || urlObj.hostname.endsWith(`.${a.domain}`)
  );

  if (api?.requiresSSL && !isSecureProtocol(url)) {
    return { allowed: false, reason: 'HTTPS required for this API' };
  }

  // Check allowed methods
  if (api?.allowedMethods && !api.allowedMethods.includes(method.toUpperCase())) {
    return { allowed: false, reason: `Method ${method} not allowed for this API` };
  }

  return { allowed: true };
}

/**
 * Secure fetch with timeout and validation
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  // Validate request
  const validation = validateExternalRequest(url, options.method || 'GET');
  if (!validation.allowed) {
    throw new Error(`Blocked external request: ${validation.reason}`);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Validate SSL certificate (fetch will fail on invalid certs by default)
    if (!response.ok && response.status === 0) {
      throw new Error('SSL certificate validation failed');
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}

/**
 * Log blocked request for monitoring
 */
export function logBlockedRequest(
  url: string,
  reason: string,
  userId?: string
): void {
  console.warn('Blocked external request:', {
    url: new URL(url).hostname, // Don't log full URL (may contain sensitive params)
    reason,
    userId,
    timestamp: new Date().toISOString()
  });
}
