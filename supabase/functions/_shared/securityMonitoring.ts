/**
 * Security Monitoring and Alerting
 * Detects unusual patterns and security threats
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Service role client for logging (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type SecurityEventType =
  | 'failed_login'
  | 'account_locked'
  | 'unusual_activity'
  | 'rate_limit_exceeded'
  | 'blocked_request'
  | 'suspicious_api_usage'
  | 'data_access_anomaly';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  email?: string;
  ipAddress?: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log security event to database
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const { error } = await supabase
    .from('security_events')
    .insert({
      event_type: event.eventType,
      severity: event.severity,
      user_id: event.userId,
      email: event.email,
      ip_address: event.ipAddress,
      description: event.description,
      metadata: event.metadata
    });

  if (error) {
    console.error('Failed to log security event:', error);
  }

  // For critical events, also log to console for immediate visibility
  if (event.severity === 'critical' || event.severity === 'high') {
    console.warn('SECURITY ALERT:', {
      type: event.eventType,
      severity: event.severity,
      description: event.description,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Record authentication attempt
 */
export async function recordAuthAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<boolean> {
  // Check if account is locked
  const { data: isLocked } = await supabase
    .rpc('is_account_locked', { p_email: email });

  if (isLocked) {
    await logSecurityEvent({
      eventType: 'account_locked',
      severity: 'high',
      email,
      ipAddress,
      description: 'Login attempt on locked account',
      metadata: { userAgent }
    });
    return false; // Account is locked
  }

  // Record the attempt
  const { error } = await supabase.rpc('record_auth_attempt', {
    p_email: email,
    p_success: success,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
    p_failure_reason: failureReason
  });

  if (error) {
    console.error('Failed to record auth attempt:', error);
  }

  if (!success) {
    await logSecurityEvent({
      eventType: 'failed_login',
      severity: 'medium',
      email,
      ipAddress,
      description: failureReason || 'Failed login attempt',
      metadata: { userAgent }
    });
  }

  return true; // Account not locked
}

/**
 * Log API access for monitoring
 */
export async function logApiAccess(
  userId: string | null,
  endpoint: string,
  method: string,
  ipAddress?: string,
  statusCode?: number,
  responseTimeMs?: number
): Promise<void> {
  const { error } = await supabase.rpc('log_api_access', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_method: method,
    p_ip_address: ipAddress,
    p_status_code: statusCode,
    p_response_time_ms: responseTimeMs
  });

  if (error) {
    console.error('Failed to log API access:', error);
  }
}

/**
 * Detect unusual API usage patterns
 */
export async function detectUnusualActivity(
  userId: string,
  endpoint: string
): Promise<boolean> {
  // Check for excessive requests in short time period
  const { count, error } = await supabase
    .from('api_access_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('accessed_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

  if (error) {
    console.error('Failed to check activity:', error);
    return false;
  }

  // Alert if more than 100 requests in 5 minutes from same user/endpoint
  if (count && count > 100) {
    await logSecurityEvent({
      eventType: 'suspicious_api_usage',
      severity: 'high',
      userId,
      description: `Unusual API activity detected: ${count} requests to ${endpoint} in 5 minutes`,
      metadata: { endpoint, requestCount: count }
    });
    return true;
  }

  return false;
}

/**
 * Monitor failed authentication attempts from IP
 */
export async function monitorFailedLogins(ipAddress: string): Promise<void> {
  const { count, error } = await supabase
    .from('auth_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .eq('success', false)
    .gte('attempted_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Last 10 minutes

  if (error) {
    console.error('Failed to monitor logins:', error);
    return;
  }

  // Alert if more than 10 failed attempts from same IP in 10 minutes
  if (count && count > 10) {
    await logSecurityEvent({
      eventType: 'unusual_activity',
      severity: 'critical',
      ipAddress,
      description: `Multiple failed login attempts detected from IP: ${count} failures in 10 minutes`,
      metadata: { failedAttempts: count }
    });
  }
}

/**
 * Get recent security events (for admin dashboard)
 */
export async function getRecentSecurityEvents(
  limit: number = 50,
  severity?: SecuritySeverity
): Promise<any[]> {
  let query = supabase
    .from('security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch security events:', error);
    return [];
  }

  return data || [];
}

/**
 * Cleanup old data (called periodically)
 */
export async function cleanupOldData(): Promise<void> {
  const { data, error } = await supabase.rpc('cleanup_old_data');

  if (error) {
    console.error('Failed to cleanup old data:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Data cleanup completed:', data);
  }
}
