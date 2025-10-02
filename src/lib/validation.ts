import { z } from "zod";

// Domain allowlist for email validation
const ALLOWED_DOMAINS = [
  // Common business domains - can be expanded
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "hotmail.com",
  "protonmail.com",
  // Add company-specific domains as needed
];

// Email validation with domain allowlist option
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .toLowerCase()
  .max(255, { message: "Email must be less than 255 characters" });

// Validate email against allowlist
export const validateEmailDomain = (email: string, allowlist?: string[]): boolean => {
  const domain = email.split('@')[1];
  const list = allowlist || ALLOWED_DOMAINS;
  // If no allowlist provided or it's empty, allow all domains
  return list.length === 0 || list.some(allowed => 
    domain === allowed || domain.endsWith(`.${allowed}`)
  );
};

// URL validation - only allow HTTPS URLs
export const urlSchema = z.string()
  .trim()
  .max(2048, { message: "URL must be less than 2048 characters" })
  .url({ message: "Invalid URL" })
  .refine(url => url.startsWith("https://"), {
    message: "Only HTTPS URLs are allowed"
  });

// Sanitize string inputs
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Attendee validation schema
export const attendeeSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: emailSchema
}).transform(data => ({
  ...data,
  name: sanitizeString(data.name, 100)
}));

// Company name validation
export const companyNameSchema = z.string()
  .trim()
  .min(1, { message: "Company name cannot be empty" })
  .max(200, { message: "Company name must be less than 200 characters" })
  .transform(str => sanitizeString(str, 200));

// Domain validation (for company domains)
export const domainSchema = z.string()
  .trim()
  .min(3, { message: "Domain must be at least 3 characters" })
  .max(253, { message: "Domain must be less than 253 characters" })
  .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, {
    message: "Invalid domain format"
  })
  .transform(domain => domain.toLowerCase());

// Calendar event validation
export const calendarEventSchema = z.object({
  id: z.string().max(100),
  title: z.string().trim().min(1).max(500),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.string().max(50),
  attendees: z.array(attendeeSchema).max(100),
  description: z.string().max(5000).optional(),
  location: z.string().max(500).optional(),
  meetingLink: urlSchema.optional(),
  timezone: z.string().max(100),
  priority: z.enum(["high", "medium", "low", "critical"])
}).transform(data => {
  const sanitizedData = {
    ...data,
    title: sanitizeString(data.title as string, 500),
    description: data.description ? sanitizeString(data.description as string, 5000) : undefined,
    location: data.location ? sanitizeString(data.location as string, 500) : undefined
  };
  return sanitizedData;
});

// Email validation schema
export const emailMessageSchema = z.object({
  id: z.string().max(100),
  sender: z.object({
    name: z.string().trim().min(1).max(100),
    email: emailSchema,
    avatar: z.string().max(10).optional()
  }),
  subject: z.string().trim().min(1).max(998),
  snippet: z.string().max(5000),
  receivedAt: z.string().datetime(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  actionItems: z.array(z.string().max(500)).max(50).optional(),
  labels: z.array(z.string().max(100)).max(20),
  isSpam: z.boolean(),
  isPromotional: z.boolean()
}).transform(data => ({
  ...data,
  sender: {
    ...data.sender,
    name: sanitizeString(data.sender.name, 100)
  },
  subject: sanitizeString(data.subject, 998),
  snippet: sanitizeString(data.snippet, 5000)
}));

// Batch validation helper
export const validateBatch = <T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  maxItems: number = 100
): T[] => {
  if (items.length > maxItems) {
    throw new Error(`Too many items. Maximum allowed: ${maxItems}`);
  }
  
  return items.map((item, index) => {
    try {
      return schema.parse(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error at item ${index}: ${error.errors[0].message}`);
      }
      throw error;
    }
  });
};

// Export validation utilities
export const validation = {
  sanitizeString,
  validateEmailDomain,
  validateBatch
};
