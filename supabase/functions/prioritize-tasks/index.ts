import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Input validation
const MAX_EVENTS = 100;
const MAX_EMAILS = 200;

function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

function validateInput(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  if (!Array.isArray(data.calendarEvents)) {
    throw new Error('Calendar events must be an array');
  }

  if (!Array.isArray(data.emails)) {
    throw new Error('Emails must be an array');
  }

  if (data.calendarEvents.length > MAX_EVENTS) {
    throw new Error(`Too many calendar events. Maximum: ${MAX_EVENTS}`);
  }

  if (data.emails.length > MAX_EMAILS) {
    throw new Error(`Too many emails. Maximum: ${MAX_EMAILS}`);
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
    
    const { calendarEvents, emails } = requestBody;
    
    // Sanitize calendar events
    const sanitizedEvents = calendarEvents.map((event: any) => ({
      ...event,
      title: sanitizeString(event.title || '', 500),
      description: event.description ? sanitizeString(event.description, 5000) : undefined
    }));
    
    // Sanitize emails
    const sanitizedEmails = emails.map((email: any) => ({
      ...email,
      subject: sanitizeString(email.subject || '', 998),
      snippet: sanitizeString(email.snippet || '', 5000)
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const currentTime = new Date().toISOString();
    
    const systemPrompt = `You are a task prioritization assistant. Analyze calendar events and emails to create a prioritized daily agenda.

Priority Scoring Rules:
- Priority 5 (Critical/Urgent): Meetings within 2 hours, urgent executive emails, today's deadlines, client escalations
- Priority 4 (High): Today's meetings (2+ hours away), important client emails, tasks due this week
- Priority 3 (Medium): Routine internal meetings, standard emails, flexible deadlines
- Priority 2 (Low): FYI emails, optional events, long-term tasks
- Priority 1 (Minimal): Newsletters, non-urgent admin items

Current time: ${currentTime}

Analyze the provided data and categorize each item appropriately.`;

    const userPrompt = `Calendar Events:
${JSON.stringify(sanitizedEvents, null, 2)}

Emails:
${JSON.stringify(sanitizedEmails, null, 2)}

Categorize and prioritize all items for today's agenda.`;

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
              name: "prioritize_tasks",
              description: "Categorize calendar events and emails into priority levels",
              parameters: {
                type: "object",
                properties: {
                  critical: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        dueTime: { type: "string" },
                        type: { type: "string", enum: ["Meeting", "Email", "Task"] }
                      },
                      required: ["description", "type"],
                      additionalProperties: false
                    }
                  },
                  high: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        dueTime: { type: "string" },
                        type: { type: "string", enum: ["Meeting", "Email", "Task"] }
                      },
                      required: ["description", "type"],
                      additionalProperties: false
                    }
                  },
                  medium: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        dueTime: { type: "string" },
                        type: { type: "string", enum: ["Meeting", "Email", "Task"] }
                      },
                      required: ["description", "type"],
                      additionalProperties: false
                    }
                  },
                  low: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" }
                      },
                      required: ["description"],
                      additionalProperties: false
                    }
                  },
                  fyi: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" }
                      },
                      required: ["description"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["critical", "high", "medium", "low", "fyi"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "prioritize_tasks" } }
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

      throw new Error(`Lovable AI request failed: ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const prioritizedTasks = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(prioritizedTasks),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in prioritize-tasks function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
