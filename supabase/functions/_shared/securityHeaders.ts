/**
 * Security Headers for Edge Functions
 * Implements comprehensive security headers following OWASP guidelines
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-timestamp, x-request-signature',
  'Access-Control-Expose-Headers': 'x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset, retry-after'
};

export const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

/**
 * Get all response headers including CORS and security headers
 */
export function getAllHeaders(additionalHeaders: HeadersInit = {}): HeadersInit {
  return {
    ...corsHeaders,
    ...securityHeaders,
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
}

/**
 * Create error response with proper headers
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  additionalHeaders: HeadersInit = {}
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: getAllHeaders(additionalHeaders)
    }
  );
}

/**
 * Create success response with proper headers
 */
export function createSuccessResponse(
  data: any,
  additionalHeaders: HeadersInit = {}
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: getAllHeaders(additionalHeaders)
    }
  );
}
