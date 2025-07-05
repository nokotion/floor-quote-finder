-- Update leads table to add verification status enum
CREATE TYPE verification_status AS ENUM ('pending_verification', 'verified', 'expired', 'failed');

-- Add verification status column if not exists (it might already be covered by status field)
-- Update the status field to include verification statuses
ALTER TABLE leads ALTER COLUMN status TYPE text;

-- Create index for faster verification lookups
CREATE INDEX IF NOT EXISTS idx_leads_verification_token ON leads(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_verification_expires ON leads(verification_expires_at) WHERE verification_expires_at IS NOT NULL;