
-- Add new columns to brand_subscriptions table for tier-based system and installation preferences
ALTER TABLE brand_subscriptions 
  ADD COLUMN sqft_tier TEXT,
  ADD COLUMN accepts_installation BOOLEAN DEFAULT false,
  ADD COLUMN installation_surcharge NUMERIC DEFAULT 0.50;

-- Create enum for sqft tiers
CREATE TYPE sqft_tier_enum AS ENUM ('0-100', '100-500', '500-1000', '1000-5000', '5000+');

-- Update sqft_tier column to use the enum
ALTER TABLE brand_subscriptions 
  ALTER COLUMN sqft_tier TYPE sqft_tier_enum USING sqft_tier::sqft_tier_enum;

-- Migrate existing data from min/max to tier system
UPDATE brand_subscriptions 
SET sqft_tier = CASE 
  WHEN max_square_footage <= 100 THEN '0-100'::sqft_tier_enum
  WHEN max_square_footage <= 500 THEN '100-500'::sqft_tier_enum
  WHEN max_square_footage <= 1000 THEN '500-1000'::sqft_tier_enum
  WHEN max_square_footage <= 5000 THEN '1000-5000'::sqft_tier_enum
  ELSE '5000+'::sqft_tier_enum
END
WHERE sqft_tier IS NULL;

-- Make sqft_tier NOT NULL after migration
ALTER TABLE brand_subscriptions 
  ALTER COLUMN sqft_tier SET NOT NULL;

-- Drop old columns (optional - can be done later after testing)
-- ALTER TABLE brand_subscriptions 
--   DROP COLUMN min_square_footage,
--   DROP COLUMN max_square_footage,
--   DROP COLUMN sqft_tier_min,
--   DROP COLUMN sqft_tier_max;

-- Update RLS policies if needed (they should still work with the existing ones)
