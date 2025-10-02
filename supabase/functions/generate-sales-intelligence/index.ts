import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Input validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_STRING_LENGTH = 1000;

function sanitizeString(input: string, maxLength: number = MAX_STRING_LENGTH): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

function validateEmail(email: string): boolean {
  if (!email || email.length > 255) return false;
  return emailRegex.test(email);
}

function validateInput(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input data');
  }

  // Validate meeting
  if (!data.meeting || typeof data.meeting !== 'object') {
    throw new Error('Invalid meeting data');
  }

  // Validate attendee
  if (!data.attendee || typeof data.attendee !== 'object') {
    throw new Error('Invalid attendee data');
  }

  if (!data.attendee.name || typeof data.attendee.name !== 'string') {
    throw new Error('Attendee name is required');
  }

  if (!validateEmail(data.attendee.email)) {
    throw new Error('Invalid attendee email');
  }

  // Validate company research
  if (!data.companyResearch || typeof data.companyResearch !== 'object') {
    throw new Error('Invalid company research data');
  }

  if (!data.companyResearch.companyName || typeof data.companyResearch.companyName !== 'string') {
    throw new Error('Company name is required');
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Validate input
    validateInput(requestBody);
    
    const { meeting, attendee, companyResearch } = requestBody;
    
    // Sanitize string inputs
    const sanitizedAttendee = {
      ...attendee,
      name: sanitizeString(attendee.name, 100),
      email: attendee.email.trim().toLowerCase(),
      jobTitle: attendee.jobTitle ? sanitizeString(attendee.jobTitle, 200) : undefined
    };
    
    const sanitizedCompany = {
      ...companyResearch,
      companyName: sanitizeString(companyResearch.companyName, 200)
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating sales intelligence for ${sanitizedAttendee.name} at ${sanitizedCompany.companyName}`);

    const systemPrompt = `You are an expert sales strategist and business development consultant. Your role is to analyze client data and generate actionable sales intelligence that helps sales teams close deals effectively.

Based on the provided meeting, attendee, and company information, generate a comprehensive sales intelligence brief that includes:

1. COMPANY SNAPSHOT - Quick overview of company status
2. FINANCIAL HEALTH - Assessment of budget availability and financial position
3. RECOMMENDED APPROACH - Specific products/services to pitch based on their needs
4. TALKING POINTS - Compelling conversation starters and value propositions

Analysis Framework:
- Match company size to appropriate product tier (SMB/Mid-Market/Enterprise)
- Identify pain points that align with our solutions
- Assess budget availability based on funding and financial health
- Map industry challenges to relevant use cases
- Evaluate decision maker's influence level
- Consider growth stage and scalability needs

Be specific, actionable, and sales-focused. Provide concrete recommendations that a sales rep can immediately use.`;

    const userPrompt = `Generate sales intelligence for this upcoming meeting:

MEETING DETAILS:
- Time: ${meeting.startTime}
- Duration: ${meeting.duration}
- Attendee: ${sanitizedAttendee.name}, ${sanitizedAttendee.jobTitle || 'N/A'}
- Company: ${sanitizedCompany.companyName}

ATTENDEE INFORMATION:
${JSON.stringify(sanitizedAttendee, null, 2)}

COMPANY RESEARCH:
${JSON.stringify(sanitizedCompany, null, 2)}

Generate a comprehensive sales intelligence brief with specific recommendations on what to sell and how to approach this client.`;

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
              name: "sales_intelligence",
              description: "Generate comprehensive sales intelligence brief",
              parameters: {
                type: "object",
                properties: {
                  companySnapshot: {
                    type: "object",
                    properties: {
                      industry: { type: "string" },
                      size: { type: "string" },
                      stage: { type: "string", enum: ["Startup", "Growth", "Enterprise", "Mature"] },
                      recentNews: { type: "string" }
                    },
                    required: ["industry", "size", "stage"]
                  },
                  financialHealth: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: ["Healthy", "Growing", "Stable", "Concerning"] },
                      latestFunding: { type: "string" },
                      revenue: { type: "string" },
                      indicators: { type: "string" }
                    },
                    required: ["status"]
                  },
                  recommendedApproach: {
                    type: "object",
                    properties: {
                      keyPainPoints: { type: "array", items: { type: "string" } },
                      whatToPitch: { type: "array", items: { type: "string" } },
                      valueProposition: { type: "string" },
                      budgetExpectation: { type: "string" },
                      decisionMakerInfluence: { type: "string", enum: ["High", "Medium", "Low"] }
                    },
                    required: ["keyPainPoints", "whatToPitch", "valueProposition"]
                  },
                  talkingPoints: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["companySnapshot", "financialHealth", "recommendedApproach", "talkingPoints"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "sales_intelligence" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI request failed: ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No sales intelligence generated');
    }

    const salesIntelligence = JSON.parse(toolCall.function.arguments);

    console.log('Sales intelligence generated successfully');

    return new Response(
      JSON.stringify({
        meeting,
        attendee: {
          name: sanitizedAttendee.name,
          title: sanitizedAttendee.jobTitle,
          email: sanitizedAttendee.email
        },
        company: sanitizedCompany.companyName,
        ...salesIntelligence,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-sales-intelligence function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
