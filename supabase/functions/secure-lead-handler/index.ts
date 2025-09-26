import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface LeadSubmission {
  customer_name: string
  customer_email: string
  customer_phone?: string
  postal_code: string
  brand_requested: string
  project_size: string
  installation_required?: boolean
  product_details?: string
  notes?: string
  client_ip?: string
  user_agent?: string
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_SUBMISSIONS_PER_IP = 3
const MAX_SUBMISSIONS_PER_EMAIL = 2

// Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 100
}

const validatePhone = (phone: string): boolean => {
  if (!phone) return true // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

const validatePostalCode = (postal: string): boolean => {
  // Canadian postal code format
  const postalRegex = /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i
  return postalRegex.test(postal)
}

const sanitizeInput = (input: string): string => {
  return input.trim().substring(0, 500) // Limit length and trim
}

const logSecurityEvent = async (supabase: any, event: string, details: any) => {
  console.log(`[SECURITY] ${event}:`, details)
  // Log to analytics for monitoring
  try {
    await supabase.from('analytics_events').insert({
      event_name: `security_${event}`,
      event_category: 'security',
      event_data: details,
      ip_address: details.client_ip,
      user_agent: details.user_agent,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

const checkRateLimit = async (supabase: any, clientIp: string, email: string): Promise<boolean> => {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString()
  
  // Check IP-based rate limit
  const { count: ipSubmissions } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', windowStart)
    .eq('session_id', clientIp) // Using session_id to track IP
  
  if (ipSubmissions >= MAX_SUBMISSIONS_PER_IP) {
    return false
  }
  
  // Check email-based rate limit
  const { count: emailSubmissions } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', windowStart)
    .eq('customer_email', email)
  
  if (emailSubmissions >= MAX_SUBMISSIONS_PER_EMAIL) {
    return false
  }
  
  return true
}

const generateSecureToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const leadData: LeadSubmission = await req.json()
    
    // Extract client information for security monitoring
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    leadData.client_ip = clientIp
    leadData.user_agent = userAgent

    console.log('Secure lead submission received from IP:', clientIp)

    // 1. Input validation and sanitization
    if (!leadData.customer_name || !leadData.customer_email || !leadData.postal_code || !leadData.brand_requested) {
      await logSecurityEvent(supabase, 'invalid_input', {
        missing_fields: {
          name: !leadData.customer_name,
          email: !leadData.customer_email,
          postal: !leadData.postal_code,
          brand: !leadData.brand_requested
        },
        client_ip: clientIp,
        user_agent: userAgent
      })
      
      return new Response(
        JSON.stringify({ error: 'Missing required fields', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(leadData.customer_email)) {
      await logSecurityEvent(supabase, 'invalid_email', {
        email: leadData.customer_email,
        client_ip: clientIp,
        user_agent: userAgent
      })
      
      return new Response(
        JSON.stringify({ error: 'Invalid email format', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate phone if provided
    if (leadData.customer_phone && !validatePhone(leadData.customer_phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate postal code
    if (!validatePostalCode(leadData.postal_code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Canadian postal code format', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 2. Rate limiting check
    const rateLimitPassed = await checkRateLimit(supabase, clientIp, leadData.customer_email)
    if (!rateLimitPassed) {
      await logSecurityEvent(supabase, 'rate_limit_exceeded', {
        email: leadData.customer_email,
        client_ip: clientIp,
        user_agent: userAgent
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please wait before submitting again.', 
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // 3. Validate brand exists in database
    const { data: brandExists } = await supabase
      .from('flooring_brands')
      .select('name')
      .eq('name', leadData.brand_requested)
      .single()
    
    if (!brandExists && leadData.brand_requested !== 'No preference - show me options') {
      await logSecurityEvent(supabase, 'invalid_brand', {
        brand: leadData.brand_requested,
        client_ip: clientIp,
        user_agent: userAgent
      })
      
      return new Response(
        JSON.stringify({ error: 'Invalid brand selection', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 4. Sanitize all string inputs
    const sanitizedData = {
      customer_name: sanitizeInput(leadData.customer_name),
      customer_email: sanitizeInput(leadData.customer_email).toLowerCase(),
      customer_phone: leadData.customer_phone ? sanitizeInput(leadData.customer_phone) : null,
      postal_code: sanitizeInput(leadData.postal_code).toUpperCase(),
      brand_requested: sanitizeInput(leadData.brand_requested),
      project_size: sanitizeInput(leadData.project_size || ''),
      installation_required: Boolean(leadData.installation_required),
      product_details: leadData.product_details ? sanitizeInput(leadData.product_details) : null,
      notes: leadData.notes ? sanitizeInput(leadData.notes) : null
    }

    // 5. Generate secure verification token
    const verificationToken = generateSecureToken()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // 6. Create temporary lead with minimal data exposure
    const { data: tempLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_name: sanitizedData.customer_name,
        customer_email: sanitizedData.customer_email,
        customer_phone: sanitizedData.customer_phone,
        postal_code: sanitizedData.postal_code,
        brand_requested: sanitizedData.brand_requested,
        timeline: sanitizedData.project_size,
        installation_required: sanitizedData.installation_required,
        product_details: sanitizedData.product_details,
        notes: sanitizedData.notes,
        status: 'pending_verification',
        is_verified: false,
        verification_token: verificationToken,
        verification_expires_at: verificationExpiry.toISOString(),
        verification_method: 'email',
        session_id: clientIp, // Track for rate limiting
        referrer: req.headers.get('referer') || null,
        created_at: new Date().toISOString()
      })
      .select('id, verification_token')
      .single()

    if (leadError) {
      console.error('Error creating temporary lead:', leadError)
      await logSecurityEvent(supabase, 'lead_creation_failed', {
        error: leadError.message,
        client_ip: clientIp,
        user_agent: userAgent
      })
      throw leadError
    }

    console.log('Secure temporary lead created:', tempLead.id)

    // 7. Send verification email (without exposing sensitive data)
    const { error: emailError } = await supabase.functions.invoke('send-verification', {
      body: {
        leadId: tempLead.id,
        method: 'email',
        contact: sanitizedData.customer_email
      }
    })

    if (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the request, just log the error
    }

    // 8. Log successful submission for monitoring
    await logSecurityEvent(supabase, 'lead_submitted', {
      lead_id: tempLead.id,
      email_domain: sanitizedData.customer_email.split('@')[1],
      postal_prefix: sanitizedData.postal_code.substring(0, 3),
      brand: sanitizedData.brand_requested,
      client_ip: clientIp,
      user_agent: userAgent
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead submitted successfully. Please check your email to verify your request.',
        lead_id: tempLead.id,
        verification_required: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in secure lead handler:', error)
    return new Response(
      JSON.stringify({
        error: 'An error occurred processing your request. Please try again.',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})