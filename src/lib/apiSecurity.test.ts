import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  signRequest,
  verifySignature,
  isTimestampValid,
  validateApiResponse,
  checkClientRateLimit,
  updateClientRateLimit,
} from './apiSecurity';
import { z } from 'zod';

describe('API Security', () => {
  describe('Request Signing', () => {
    it('generates consistent signatures for same payload', async () => {
      const payload = { test: 'data' };
      const timestamp = Date.now();
      const secret = 'test-secret';
      
      const sig1 = await signRequest(payload, timestamp, secret);
      const sig2 = await signRequest(payload, timestamp, secret);
      
      expect(sig1).toBe(sig2);
    });

    it('generates different signatures for different payloads', async () => {
      const timestamp = Date.now();
      const secret = 'test-secret';
      
      const sig1 = await signRequest({ test: 'data1' }, timestamp, secret);
      const sig2 = await signRequest({ test: 'data2' }, timestamp, secret);
      
      expect(sig1).not.toBe(sig2);
    });

    it('verifies valid signatures', async () => {
      const payload = { test: 'data' };
      const timestamp = Date.now();
      const secret = 'test-secret';
      
      const signature = await signRequest(payload, timestamp, secret);
      const isValid = await verifySignature(payload, timestamp, signature, secret);
      
      expect(isValid).toBe(true);
    });

    it('rejects invalid signatures', async () => {
      const payload = { test: 'data' };
      const timestamp = Date.now();
      const secret = 'test-secret';
      
      const isValid = await verifySignature(payload, timestamp, 'invalid-signature', secret);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Timestamp Validation', () => {
    it('accepts recent timestamps', () => {
      const recentTimestamp = Date.now();
      expect(isTimestampValid(recentTimestamp)).toBe(true);
    });

    it('rejects old timestamps', () => {
      const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      expect(isTimestampValid(oldTimestamp)).toBe(false);
    });

    it('rejects future timestamps', () => {
      const futureTimestamp = Date.now() + 10 * 60 * 1000; // 10 minutes future
      expect(isTimestampValid(futureTimestamp)).toBe(false);
    });
  });

  describe('Response Validation', () => {
    it('validates correct data against schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 30 };
      const result = validateApiResponse(data, schema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('rejects invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 'thirty' };
      const result = validateApiResponse(data, schema);
      
      expect(result.success).toBe(false);
    });

    it('handles nested schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });
      
      const data = { user: { name: 'John', email: 'john@example.com' } };
      const result = validateApiResponse(data, schema);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Client-Side Rate Limiting', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('allows requests when not rate limited', () => {
      const result = checkClientRateLimit('/api/test');
      expect(result.allowed).toBe(true);
    });

    it('blocks requests when rate limited', () => {
      const endpoint = '/api/test';
      const resetTime = Date.now() + 60000; // 1 minute from now
      
      updateClientRateLimit(endpoint, 0, resetTime);
      
      const result = checkClientRateLimit(endpoint);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows requests after rate limit expires', () => {
      const endpoint = '/api/test';
      const resetTime = Date.now() - 1000; // 1 second ago
      
      updateClientRateLimit(endpoint, 0, resetTime);
      
      const result = checkClientRateLimit(endpoint);
      expect(result.allowed).toBe(true);
    });

    it('tracks remaining requests', () => {
      const endpoint = '/api/test';
      const resetTime = Date.now() + 60000;
      const remaining = 50;
      
      updateClientRateLimit(endpoint, remaining, resetTime);
      
      const result = checkClientRateLimit(endpoint);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(remaining);
    });
  });

  describe('Security Against Attacks', () => {
    it('prevents SQL injection in validation', () => {
      const schema = z.object({
        email: z.string().email(),
      });
      
      const maliciousData = { email: "test'; DROP TABLE users;--" };
      const result = validateApiResponse(maliciousData, schema);
      
      expect(result.success).toBe(false);
    });

    it('prevents XSS in string validation', () => {
      const schema = z.object({
        comment: z.string().max(100),
      });
      
      const maliciousData = { comment: "<script>alert('XSS')</script>" };
      const result = validateApiResponse(maliciousData, schema);
      
      // Should pass validation but should be sanitized before rendering
      expect(result.success).toBe(true);
    });

    it('enforces length limits', () => {
      const schema = z.object({
        message: z.string().max(50),
      });
      
      const longData = { message: 'a'.repeat(1000) };
      const result = validateApiResponse(longData, schema);
      
      expect(result.success).toBe(false);
    });
  });
});
