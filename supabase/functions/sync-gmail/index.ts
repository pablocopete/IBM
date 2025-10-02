import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get the user's email connection
    const { data: connection, error: connError } = await supabase
      .from('email_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'No email connection found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch emails from Gmail API
    const gmailResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50',
      {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!gmailResponse.ok) {
      throw new Error('Failed to fetch emails from Gmail');
    }

    const { messages } = await gmailResponse.json();
    
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch details for each message
    const emailPromises = messages.map(async (msg: any) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
          },
        }
      );
      return detailResponse.json();
    });

    const emailDetails = await Promise.all(emailPromises);

    // Parse and insert emails
    const emailsToInsert = emailDetails.map((email: any) => {
      const headers = email.payload.headers;
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const fromMatch = from.match(/(.*?)\s*<(.+?)>/) || [null, from, from];
      
      return {
        user_id: user.id,
        email_id: email.id,
        thread_id: email.threadId,
        subject: getHeader('Subject'),
        sender_name: fromMatch[1]?.trim() || fromMatch[2],
        sender_email: fromMatch[2]?.trim() || from,
        body_snippet: email.snippet,
        received_at: new Date(parseInt(email.internalDate)).toISOString(),
        is_read: !email.labelIds?.includes('UNREAD'),
        labels: email.labelIds || [],
      };
    });

    // Insert emails (upsert to avoid duplicates)
    const { error: insertError } = await supabase
      .from('user_emails')
      .upsert(emailsToInsert, { 
        onConflict: 'email_id',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('Error inserting emails:', insertError);
      throw insertError;
    }

    // Update last synced time
    await supabase
      .from('email_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    return new Response(
      JSON.stringify({ success: true, count: emailsToInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-gmail function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});