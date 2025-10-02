import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Data export requested by user: ${user.id}`);

    // Create export request record
    const { data: exportRequest, error: requestError } = await supabaseClient
      .from('data_requests')
      .insert({
        user_id: user.id,
        request_type: 'export',
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Collect user data from all tables
    const userData: any = {
      user_profile: { id: user.id, email: user.email },
      export_date: new Date().toISOString(),
      request_id: exportRequest.id,
    };

    // Get user consents
    const { data: consents } = await supabaseClient
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id);
    userData.consents = consents || [];

    // Get API permissions
    const { data: permissions } = await supabaseClient
      .from('api_permissions')
      .select('*')
      .eq('user_id', user.id);
    userData.api_permissions = permissions || [];

    // Get email preferences
    const { data: emailPrefs } = await supabaseClient
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    userData.email_preferences = emailPrefs || null;

    // Get data requests history
    const { data: requests } = await supabaseClient
      .from('data_requests')
      .select('*')
      .eq('user_id', user.id);
    userData.data_requests = requests || [];

    // Generate JSON export
    const exportData = JSON.stringify(userData, null, 2);
    const exportBlob = new Blob([exportData], { type: 'application/json' });

    // In a production environment, you would upload this to a storage bucket
    // and provide a secure download link. For now, we'll return the data directly.

    // Update the request status
    await supabaseClient
      .from('data_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: 'Data export completed successfully',
      })
      .eq('id', exportRequest.id);

    console.log(`Data export completed for user: ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data export completed',
        data: userData,
        download_info: 'Data is included in this response for immediate download',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in request-data-export function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
