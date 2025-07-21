
-- Step 1: Drop the old restrictive unique constraint
ALTER TABLE brand_subscriptions
DROP CONSTRAINT IF EXISTS brand_subscriptions_retailer_id_brand_name_key;

-- Step 2: Add the new unique constraint that allows multiple tiers per brand
ALTER TABLE brand_subscriptions
ADD CONSTRAINT brand_subscriptions_retailer_id_brand_name_sqft_tier_key
UNIQUE (retailer_id, brand_name, sqft_tier);

-- Step 3: Optional cleanup - remove any existing duplicate records
-- This finds and removes duplicates based on the new constraint
DELETE FROM brand_subscriptions
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY retailer_id, brand_name, sqft_tier ORDER BY created_at) AS rn
    FROM brand_subscriptions
  ) t
  WHERE t.rn > 1
);
