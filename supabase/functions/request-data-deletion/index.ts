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

    // Create Supabase client with service role for deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client for user authentication
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

    console.log(`Data deletion requested by user: ${user.id}`);

    // Create deletion request record
    const { data: deletionRequest, error: requestError } = await supabaseClient
      .from('data_requests')
      .insert({
        user_id: user.id,
        request_type: 'deletion',
        status: 'processing',
      })
      .select()
      .single();

    if (requestError) throw requestError;

    try {
      // Delete user data from all tables (in correct order due to foreign keys)
      
      // Delete email preferences
      await supabaseAdmin
        .from('email_preferences')
        .delete()
        .eq('user_id', user.id);

      // Delete API permissions
      await supabaseAdmin
        .from('api_permissions')
        .delete()
        .eq('user_id', user.id);

      // Delete user consents
      await supabaseAdmin
        .from('user_consents')
        .delete()
        .eq('user_id', user.id);

      // Mark data request as completed
      await supabaseAdmin
        .from('data_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: 'All user data deleted successfully',
        })
        .eq('id', deletionRequest.id);

      // Finally, delete the user account
      // This will cascade delete data_requests and other related records
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteUserError) {
        throw new Error(`Failed to delete user account: ${deleteUserError.message}`);
      }

      console.log(`Data deletion completed for user: ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Your account and all associated data have been permanently deleted.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (deletionError) {
      // Update request status to failed
      await supabaseAdmin
        .from('data_requests')
        .update({
          status: 'failed',
          notes: `Deletion failed: ${deletionError instanceof Error ? deletionError.message : 'Unknown error'}`,
        })
        .eq('id', deletionRequest.id);

      throw deletionError;
    }
  } catch (error) {
    console.error('Error in request-data-deletion function:', error);
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
