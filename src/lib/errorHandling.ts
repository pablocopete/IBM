/**
 * Error handling utilities for graceful degradation
 */

export interface ErrorState {
  hasError: boolean;
  message: string;
  severity: 'warning' | 'error' | 'info';
  canRetry: boolean;
  fallbackData?: any;
}

export const handleApiError = (error: any): ErrorState => {
  // Rate limit error
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return {
      hasError: true,
      message: 'Service temporarily unavailable. Your data has been cached.',
      severity: 'warning',
      canRetry: true,
    };
  }

  // Network errors
  if (error instanceof TypeError || error?.message?.includes('fetch')) {
    return {
      hasError: true,
      message: 'Connection issue detected. Using cached data.',
      severity: 'warning',
      canRetry: true,
    };
  }

  // Blocked/forbidden access
  if (error?.status === 403 || error?.status === 451) {
    return {
      hasError: true,
      message: 'Access restricted. Using alternative data sources.',
      severity: 'info',
      canRetry: false,
    };
  }

  // Server errors
  if (error?.status >= 500) {
    return {
      hasError: true,
      message: 'Service temporarily unavailable. Please try again.',
      severity: 'error',
      canRetry: true,
    };
  }

  // Generic error
  return {
    hasError: true,
    message: error?.message || 'An unexpected error occurred.',
    severity: 'error',
    canRetry: false,
  };
};

export const createFallbackData = <T>(type: 'calendar' | 'email' | 'attendee' | 'company' | 'sales'): T | null => {
  switch (type) {
    case 'calendar':
      return null; // Will use mock calendar data already in component
    case 'email':
      return null; // Will use mock email data already in component
    case 'attendee':
      return {
        message: 'Unable to fetch complete intelligence. Basic information displayed.',
      } as any;
    case 'company':
      return {
        message: 'Company research unavailable. Proceeding with meeting details.',
      } as any;
    case 'sales':
      return {
        message: 'Advanced intelligence unavailable. Basic recommendations provided.',
      } as any;
    default:
      return null;
  }
};

export const getUserFriendlyMessage = (errorType: string): string => {
  const messages: Record<string, string> = {
    'calendar_api_fail': 'Calendar data temporarily unavailable. Showing cached events.',
    'email_fetch_fail': 'Email sync paused. Calendar data will continue to work.',
    'company_research_fail': 'Company insights unavailable. Meeting details remain accessible.',
    'website_blocked': 'Some data sources unavailable. Using alternative information.',
    'rate_limit': 'Too many requests. Please wait a moment before trying again.',
    'auth_fail': 'Authentication issue. Please check your connection settings.',
  };

  return messages[errorType] || 'Service temporarily unavailable. Please try again.';
};
