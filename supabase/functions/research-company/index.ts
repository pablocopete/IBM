import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Input validation
const MAX_COMPANY_NAME_LENGTH = 200;
const MAX_DOMAIN_LENGTH = 253;
const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;

function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

function validateDomain(domain: string): boolean {
  if (!domain || domain.length < 3 || domain.length > MAX_DOMAIN_LENGTH) {
    return false;
  }
  return domainRegex.test(domain);
}

function validateCompanyName(name: string): boolean {
  if (!name || name.trim().length === 0 || name.length > MAX_COMPANY_NAME_LENGTH) {
    return false;
  }
  return true;
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
    
    // Validate request body
    if (!requestBody || typeof requestBody !== 'object') {
      throw new Error('Invalid request body');
    }

    const { companyName, companyDomain } = requestBody;

    // Validate company name
    if (!validateCompanyName(companyName)) {
      throw new Error('Invalid company name');
    }

    // Validate domain
    if (!validateDomain(companyDomain)) {
      throw new Error('Invalid company domain format');
    }

    // Sanitize inputs
    const sanitizedCompanyName = sanitizeString(companyName, MAX_COMPANY_NAME_LENGTH);
    const sanitizedDomain = companyDomain.trim().toLowerCase();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Researching company: ${sanitizedCompanyName} (${sanitizedDomain})`);

    const systemPrompt = `You are a professional business intelligence analyst specializing in company research and competitive analysis. Your role is to gather comprehensive information about companies from public sources.

Conduct thorough research on the company and provide:

1. COMPANY PROFILE
   - Company size and employee headcount
   - Industry and sector classification
   - Founded year and headquarters location
   - Product/service offerings
   - Business model

2. FINANCIAL INTELLIGENCE
   - Latest revenue figures (if public)
   - Funding rounds and investors (if startup/private)
   - Stock performance and market cap (if publicly traded)
   - Recent financial news and earnings
   - Growth trajectory and indicators
   - Recent acquisitions or partnerships

3. RECENT NEWS & DEVELOPMENTS
   - Latest press releases (last 6 months)
   - Product launches or updates
   - Executive changes
   - Strategic initiatives

4. PAIN POINT ANALYSIS
   - Industry challenges the company likely faces
   - Technology stack gaps or opportunities
   - Scaling issues based on company stage
   - Competitive pressures mentioned in recent news
   - Market trends affecting them

5. STRATEGIC INSIGHTS
   - Key competitors
   - Market position
   - Growth opportunities
   - Risk factors

Base your analysis on current, publicly available information. Cite confidence levels and note when information is estimated or unavailable.`;

    const userPrompt = `Research this company:
Company Name: ${sanitizedCompanyName}
Website: ${sanitizedDomain}

Provide comprehensive business intelligence covering company profile, financial data, recent news, pain points, and strategic insights.`;

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
              name: "company_research",
              description: "Structure comprehensive company research data",
              parameters: {
                type: "object",
                properties: {
                  profile: {
                    type: "object",
                    properties: {
                      size: { type: "string" },
                      headcount: { type: "string" },
                      industry: { type: "string" },
                      sector: { type: "string" },
                      founded: { type: "string" },
                      headquarters: { type: "string" },
                      products: { type: "array", items: { type: "string" } },
                      businessModel: { type: "string" }
                    },
                    required: ["industry"]
                  },
                  financial: {
                    type: "object",
                    properties: {
                      revenue: { type: "string" },
                      fundingRounds: { type: "array", items: { type: "string" } },
                      investors: { type: "array", items: { type: "string" } },
                      stockSymbol: { type: "string" },
                      marketCap: { type: "string" },
                      growthIndicators: { type: "array", items: { type: "string" } },
                      recentAcquisitions: { type: "array", items: { type: "string" } },
                      partnerships: { type: "array", items: { type: "string" } }
                    }
                  },
                  recentNews: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        headline: { type: "string" },
                        date: { type: "string" },
                        summary: { type: "string" },
                        source: { type: "string" }
                      },
                      required: ["headline"]
                    }
                  },
                  painPoints: {
                    type: "object",
                    properties: {
                      industryChallenges: { type: "array", items: { type: "string" } },
                      technologyGaps: { type: "array", items: { type: "string" } },
                      scalingIssues: { type: "array", items: { type: "string" } },
                      competitivePressures: { type: "array", items: { type: "string" } }
                    }
                  },
                  strategicInsights: {
                    type: "object",
                    properties: {
                      keyCompetitors: { type: "array", items: { type: "string" } },
                      marketPosition: { type: "string" },
                      opportunities: { type: "array", items: { type: "string" } },
                      risks: { type: "array", items: { type: "string" } }
                    }
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"]
                  },
                  lastUpdated: { type: "string" }
                },
                required: ["profile", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "company_research" } }
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
      throw new Error('No research data returned');
    }

    const research = JSON.parse(toolCall.function.arguments);

    console.log('Company research complete:', sanitizedCompanyName);

    return new Response(
      JSON.stringify({
        companyName: sanitizedCompanyName,
        companyDomain: sanitizedDomain,
        ...research,
        researchedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in research-company function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
