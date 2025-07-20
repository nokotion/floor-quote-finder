
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Timeout wrapper for any async operations
async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 5000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Testing secret configuration...`);

  try {
    // Test all required secrets with timeout protection
    const secretsTest = await withTimeout(
      testSecrets(requestId),
      10000,
      'Secrets test timed out'
    );

    if (secretsTest.missingSecrets.length > 0) {
      console.error(`[${requestId}] Missing required secrets:`, secretsTest.missingSecrets);
      return new Response(
        JSON.stringify({ 
          error: 'Missing secrets configuration',
          missing: secretsTest.missingSecrets,
          message: 'Please configure the missing secrets in your Supabase project'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] All secrets are configured!`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'All verification secrets are properly configured',
        configured: Object.keys(secretsTest.secrets),
        requestId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error(`[${requestId}] Secret test failed:`, error.message);
    
    return new Response(
      JSON.stringify({ 
        error: 'Secret configuration test failed',
        message: error.message?.includes('timed out') ? 
          'Secret test timed out. Please try again.' :
          'Failed to test secret configuration',
        details: error.message || 'Unknown error occurred',
        requestId
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function testSecrets(requestId: string) {
  console.log(`[${requestId}] Checking required secrets...`);

  const secrets = {
    RESEND_API_KEY: Deno.env.get('RESEND_API_KEY'),
    TWILIO_ACCOUNT_SID: Deno.env.get('TWILIO_ACCOUNT_SID'),
    TWILIO_AUTH_TOKEN: Deno.env.get('TWILIO_AUTH_TOKEN'),
    TWILIO_VERIFY_SERVICE_SID: Deno.env.get('TWILIO_VERIFY_SERVICE_SID'),
  };

  console.log(`[${requestId}] Secret status check:`);
  for (const [key, value] of Object.entries(secrets)) {
    const status = value ? '✅ CONFIGURED' : '❌ MISSING';
    const preview = value ? `${value.substring(0, 10)}...` : 'not set';
    console.log(`[${requestId}] ${key}: ${status} (${preview})`);
  }

  const missingSecrets = Object.entries(secrets)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  return {
    secrets,
    missingSecrets
  };
}

serve(handler);
