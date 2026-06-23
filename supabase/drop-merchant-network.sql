-- Run in Supabase SQL Editor to drop deprecated store columns
ALTER TABLE stores DROP COLUMN IF EXISTS merchant_id;
ALTER TABLE stores DROP COLUMN IF EXISTS network_id;

-- Ensure coupon order column exists
ALTER TABLE stores ADD COLUMN IF NOT EXISTS coupon_order UUID[] DEFAULT NULL;
