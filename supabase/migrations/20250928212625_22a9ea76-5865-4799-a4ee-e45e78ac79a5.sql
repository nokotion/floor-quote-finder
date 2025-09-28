-- Add lead forwarding email fields to retailers table
ALTER TABLE public.retailers 
ADD COLUMN lead_notification_email text,
ADD COLUMN lead_forwarding_emails text[] DEFAULT '{}',
ADD COLUMN email_notification_preference text DEFAULT 'immediate' CHECK (email_notification_preference IN ('immediate', 'daily_digest', 'disabled'));