-- Fix system settings for transfer and signing system
-- This ensures the required settings exist in the database

-- Insert transfer market settings if they don't exist
INSERT INTO system_settings (key, value) 
SELECT 'transfer_market_enabled', 'false'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'transfer_market_enabled'
);

-- Insert signings settings if they don't exist
INSERT INTO system_settings (key, value) 
SELECT 'signings_enabled', 'false'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'signings_enabled'
);

-- Insert transfer offer duration setting if it doesn't exist
INSERT INTO system_settings (key, value) 
SELECT 'transfer_offer_duration', '14400'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'transfer_offer_duration'
);

-- Insert signing duration setting if it doesn't exist
INSERT INTO system_settings (key, value) 
SELECT 'signing_duration', '86400'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'signing_duration'
);

-- Verify the settings were created
SELECT key, value FROM system_settings 
WHERE key IN ('transfer_market_enabled', 'signings_enabled', 'transfer_offer_duration', 'signing_duration')
ORDER BY key;
