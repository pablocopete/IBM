import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { attendees } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing attendees:', attendees);

    // Process each attendee
    const attendeeIntelligence = await Promise.all(
      attendees.map(async (attendee: { name: string; email: string }) => {
        const emailDomain = attendee.email.split('@')[1];
        const companyName = emailDomain.split('.')[0];

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
          console.error('Lovable AI error:', response.status, errorText);
          
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
          console.error('No tool call in response for', attendee.name);
          return {
            name: attendee.name,
            email: attendee.email,
            emailDomain,
            error: 'Failed to analyze attendee'
          };
        }

        const intelligence = JSON.parse(toolCall.function.arguments);

        return {
          name: attendee.name,
          email: attendee.email,
          emailDomain,
          ...intelligence
        };
      })
    );

    console.log('Analysis complete:', attendeeIntelligence);

    return new Response(
      JSON.stringify({ attendees: attendeeIntelligence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-attendees function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
