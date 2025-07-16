import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Testing secret configuration...');

  // Test all required secrets
  const secrets = {
    RESEND_API_KEY: Deno.env.get('RESEND_API_KEY'),
    TWILIO_ACCOUNT_SID: Deno.env.get('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: Deno.env.get('TWILIO_AUTH_TOKEN'),
    TWILIO_VERIFY_SERVICE_SID: Deno.env.get('TWILIO_VERIFY_SERVICE_SID'),
  };

  console.log('Secret status check:');
  for (const [key, value] of Object.entries(secrets)) {
    const status = value ? '✅ CONFIGURED' : '❌ MISSING';
    const preview = value ? `${value.substring(0, 10)}...` : 'not set';
    console.log(`${key}: ${status} (${preview})`);
  }

  const missingSecrets = Object.entries(secrets)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingSecrets.length > 0) {
    console.error('CRITICAL: Missing required secrets:', missingSecrets);
    return new Response(
      JSON.stringify({ 
        error: 'Missing secrets configuration',
        missing: missingSecrets,
        message: 'Please configure the missing secrets in your Supabase project'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  console.log('✅ All secrets are configured!');

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'All verification secrets are properly configured',
      configured: Object.keys(secrets)
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
};

serve(handler);