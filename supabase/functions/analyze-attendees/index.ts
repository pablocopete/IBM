import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, RATE_LIMITS, createRateLimitHeaders, sanitizeForLogging } from "../_shared/rateLimiting.ts";
import { getAllHeaders, createErrorResponse, createSuccessResponse } from "../_shared/securityHeaders.ts";

// Input validation schemas
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_ATTENDEES = 50;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

function validateEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  return emailRegex.test(email);
}

function validateAttendee(attendee: any): { name: string; email: string } {
  if (!attendee || typeof attendee !== 'object') {
    throw new Error('Invalid attendee format');
  }

  const { name, email } = attendee;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Attendee name is required');
  }

  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`Name too long: maximum ${MAX_NAME_LENGTH} characters`);
  }

  return {
    name: sanitizeString(name, MAX_NAME_LENGTH),
    email: email.trim().toLowerCase()
  };
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getAllHeaders() });
  }

  try {
    // Rate limiting - use IP or anonymous ID since no auth
    const clientId = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(clientId, 'analyze-attendees', RATE_LIMITS.AI_ANALYSIS);
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${clientId}`);
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        createRateLimitHeaders(rateLimit)
      );
    }

    const requestBody = await req.json();
    
    // Validate request body structure
    if (!requestBody || typeof requestBody !== 'object') {
      throw new Error('Invalid request body');
    }

    const { attendees } = requestBody;
    
    // Validate attendees array
    if (!Array.isArray(attendees)) {
      throw new Error('Attendees must be an array');
    }

    if (attendees.length === 0) {
      throw new Error('At least one attendee is required');
    }

    if (attendees.length > MAX_ATTENDEES) {
      throw new Error(`Too many attendees. Maximum allowed: ${MAX_ATTENDEES}`);
    }

    // Validate and sanitize each attendee
    const validatedAttendees = attendees.map((attendee, index) => {
      try {
        return validateAttendee(attendee);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        throw new Error(`Attendee ${index + 1}: ${errorMessage}`);
      }
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Log sanitized request (no sensitive email content)
    console.log('Analyzing attendees:', sanitizeForLogging({ count: validatedAttendees.length }));

    // Process each attendee
    const analyzedAttendees = [];

    for (const attendee of validatedAttendees) {
      const emailDomain = attendee.email.split('@')[1];
      const companyName = sanitizeString(emailDomain.split('.')[0], 100);


      console.log(`Researching ${attendee.name} from ${companyName}`);

      const systemPrompt = `You are a professional research assistant specializing in gathering business intelligence about people and companies. Your task is to analyze LinkedIn profiles and company information.

Extract and structure the following information:
- Job title and current role
- Years at current company (estimate if not exact)
- Professional background summary
- Recent professional activities or posts (if available)
- Company information and industry

Be professional, factual, and concise. If information is not available, indicate it clearly.`;

      const userPrompt = `Research the following person:
Name: ${attendee.name}
Email: ${attendee.email}
Company Domain: ${emailDomain}
Likely Company: ${companyName}

Please search for their LinkedIn profile and company information, then provide a structured analysis.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "attendee_intelligence",
                description: "Structure attendee and company intelligence",
                parameters: {
                  type: "object",
                  properties: {
                    jobTitle: { type: "string" },
                    role: { type: "string" },
                    yearsAtCompany: { type: "string" },
                    professionalBackground: { type: "string" },
                    recentActivities: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    companyName: { type: "string" },
                    companyIndustry: { type: "string" },
                    linkedInUrl: { type: "string" },
                    confidence: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description: "Confidence level of the information gathered"
                    }
                  },
                  required: ["jobTitle", "role", "companyName", "confidence"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "attendee_intelligence" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, sanitizeForLogging(errorText));
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (response.status === 402) {
          throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
        }

        throw new Error(`AI request failed: ${errorText}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('No tool call in response for attendee');
        analyzedAttendees.push({
          name: attendee.name,
          email: attendee.email,
          emailDomain,
          error: 'Failed to analyze attendee'
        });
        continue;
      }

      const intelligence = JSON.parse(toolCall.function.arguments);

      analyzedAttendees.push({
        name: attendee.name,
        email: attendee.email,
        emailDomain,
        ...intelligence
      });
    }

    console.log('Analysis complete');

    return createSuccessResponse(
      { attendees: analyzedAttendees },
      createRateLimitHeaders(rateLimit)
    );
  } catch (error) {
    console.error('Error in analyze-attendees function:', sanitizeForLogging(error));
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
