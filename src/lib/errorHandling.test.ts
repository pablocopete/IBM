import { describe, it, expect } from 'vitest';
import { handleApiError, createFallbackData, getUserFriendlyMessage } from './errorHandling';

describe('Error Handling', () => {
  describe('handleApiError', () => {
    it('identifies rate limit errors', () => {
      const error = { status: 429, message: 'Too many requests' };
      const result = handleApiError(error);
      
      expect(result.severity).toBe('warning');
      expect(result.canRetry).toBe(true);
      expect(result.message).toContain('temporarily unavailable');
    });

    it('identifies network errors', () => {
      const error = new TypeError('fetch failed');
      const result = handleApiError(error);
      
      expect(result.severity).toBe('warning');
      expect(result.canRetry).toBe(true);
      expect(result.message).toContain('cached data');
    });

    it('identifies forbidden access', () => {
      const error = { status: 403 };
      const result = handleApiError(error);
      
      expect(result.severity).toBe('info');
      expect(result.canRetry).toBe(false);
      expect(result.message).toContain('alternative data sources');
    });

    it('identifies server errors', () => {
      const error = { status: 500 };
      const result = handleApiError(error);
      
      expect(result.severity).toBe('error');
      expect(result.canRetry).toBe(true);
    });

    it('handles generic errors', () => {
      const error = { message: 'Unknown error' };
      const result = handleApiError(error);
      
      expect(result.hasError).toBe(true);
      expect(result.message).toBe('Unknown error');
    });
  });

  describe('createFallbackData', () => {
    it('returns null for calendar type', () => {
      const result = createFallbackData('calendar');
      expect(result).toBeNull();
    });

    it('returns null for email type', () => {
      const result = createFallbackData('email');
      expect(result).toBeNull();
    });

    it('returns message for attendee type', () => {
      const result = createFallbackData('attendee');
      expect(result).toHaveProperty('message');
    });

    it('returns message for company type', () => {
      const result = createFallbackData('company');
      expect(result).toHaveProperty('message');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('returns specific message for known error types', () => {
      expect(getUserFriendlyMessage('calendar_api_fail')).toContain('Calendar data');
      expect(getUserFriendlyMessage('email_fetch_fail')).toContain('Email sync');
      expect(getUserFriendlyMessage('rate_limit')).toContain('Too many requests');
    });

    it('returns generic message for unknown error types', () => {
      const message = getUserFriendlyMessage('unknown_error');
      expect(message).toContain('temporarily unavailable');
    });
  });
});
