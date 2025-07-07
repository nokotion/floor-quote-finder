import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendCredentialsRequest {
  retailerId: string;
}

// Generate a random temporary password
function generateTempPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('=== RESEND CREDENTIALS FUNCTION START ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { retailerId }: ResendCredentialsRequest = await req.json();

    if (!retailerId) {
      return new Response(JSON.stringify({ error: 'Retailer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get retailer details
    console.log('Fetching retailer details...');
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', retailerId)
      .single();

    if (retailerError || !retailer) {
      console.error('Retailer fetch error:', retailerError);
      return new Response(JSON.stringify({ error: 'Retailer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (retailer.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Retailer is not approved' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();
    console.log('Generated temp password for:', retailer.email);

    // Find and update existing user password
    console.log('Finding existing user...');
    if (!retailer.user_id) {
      throw new Error('Retailer has no associated user ID');
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      retailer.user_id,
      { 
        password: tempPassword,
        user_metadata: { 
          password_reset_required: true,
          temp_password_generated_at: new Date().toISOString()
        }
      }
    );

    if (updateError) {
      console.error('Error updating user password:', updateError);
      throw new Error(`Failed to update user password: ${updateError.message}`);
    }

    console.log('User password updated successfully');

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        password_reset_required: true,
        temp_password_generated_at: new Date().toISOString()
      })
      .eq('id', retailer.user_id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Send email using send-retailer-welcome function
    console.log('Sending email via send-retailer-welcome function...');
    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/retailer/login`;
    
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-retailer-welcome', {
      body: {
        email: retailer.email,
        businessName: retailer.business_name,
        contactName: retailer.contact_name,
        tempPassword: tempPassword,
        loginUrl: loginUrl
      }
    });

    if (emailError) {
      console.error('Email sending error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log('Email sent successfully via send-retailer-welcome');

    return new Response(JSON.stringify({
      success: true,
      message: 'Login credentials sent successfully',
      emailId: emailData?.emailId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in resend-retailer-credentials function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to resend credentials'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);