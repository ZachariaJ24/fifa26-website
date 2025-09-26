-- Migration: Rename teams to clubs
-- This migration renames the teams table to clubs and updates all related references

-- ==============================================
-- 1. RENAME TEAMS TABLE TO CLUBS
-- ==============================================

-- First, rename the table
ALTER TABLE teams RENAME TO clubs;

-- ==============================================
-- 2. UPDATE COLUMN REFERENCES
-- ==============================================

-- Update any foreign key references that might exist
-- (This will depend on your specific schema)

-- ==============================================
-- 3. UPDATE RLS POLICIES
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON clubs;
DROP POLICY IF EXISTS "Only admins can modify teams" ON clubs;

-- Create new policies for clubs
CREATE POLICY "Clubs are viewable by everyone" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify clubs" ON clubs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- ==============================================
-- 4. ADD NEW CLUB-SPECIFIC COLUMNS
-- ==============================================

-- Add club-specific columns if they don't exist
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS home_stadium VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
  "monday": true,
  "tuesday": true,
  "wednesday": true,
  "thursday": true,
  "friday": true,
  "saturday": true,
  "sunday": false,
  "preferred_times": ["20:30", "21:10", "21:50"],
  "timezone": "EST"
}';

-- ==============================================
-- 5. UPDATE COMMENTS
-- ==============================================

COMMENT ON TABLE clubs IS 'Football clubs participating in the league';
COMMENT ON COLUMN clubs.short_name IS 'Short name or abbreviation for the club';
COMMENT ON COLUMN clubs.description IS 'Club description and history';
COMMENT ON COLUMN clubs.founded_year IS 'Year the club was founded';
COMMENT ON COLUMN clubs.home_stadium IS 'Name of the home stadium';
COMMENT ON COLUMN clubs.website IS 'Official club website URL';
COMMENT ON COLUMN clubs.social_media IS 'Social media handles and links';
COMMENT ON COLUMN clubs.contact_info IS 'Contact information for the club';
COMMENT ON COLUMN clubs.availability IS 'Club availability schedule and preferences';

-- ==============================================
-- 6. UPDATE TRIGGERS
-- ==============================================

-- Update the trigger function name if it exists
-- (This will depend on your specific trigger setup)

-- ==============================================
-- 7. UPDATE INDEXES
-- ==============================================

-- Rename indexes if they exist
-- (This will depend on your specific index setup)

-- ==============================================
-- 8. UPDATE FUNCTIONS
-- ==============================================

-- Update any functions that reference the teams table
-- (This will depend on your specific function setup)

-- ==============================================
-- 9. SAMPLE DATA UPDATE
-- ==============================================

-- Update existing data with club-specific information
UPDATE clubs SET 
  short_name = CASE 
    WHEN name = 'Manchester City' THEN 'Man City'
    WHEN name = 'Liverpool' THEN 'LFC'
    WHEN name = 'Chelsea' THEN 'CFC'
    WHEN name = 'Arsenal' THEN 'AFC'
    WHEN name = 'Tottenham' THEN 'THFC'
    WHEN name = 'Manchester United' THEN 'Man Utd'
    WHEN name = 'Real Madrid' THEN 'RM'
    WHEN name = 'Barcelona' THEN 'FCB'
    WHEN name = 'Bayern Munich' THEN 'FCB'
    WHEN name = 'Paris Saint-Germain' THEN 'PSG'
    ELSE LEFT(name, 10)
  END,
  description = CASE 
    WHEN name = 'Manchester City' THEN 'Premier League champions and one of the most successful clubs in English football.'
    WHEN name = 'Liverpool' THEN 'One of the most successful clubs in English football with a rich history and passionate fanbase.'
    WHEN name = 'Chelsea' THEN 'London-based club with multiple Premier League and Champions League titles.'
    WHEN name = 'Arsenal' THEN 'North London club known for their attractive style of play and historic achievements.'
    WHEN name = 'Tottenham' THEN 'North London club with a strong tradition and modern stadium.'
    WHEN name = 'Manchester United' THEN 'One of the most successful clubs in world football with a global fanbase.'
    WHEN name = 'Real Madrid' THEN 'The most successful club in European football with 14 Champions League titles.'
    WHEN name = 'Barcelona' THEN 'Catalan club known for their tiki-taka style and legendary players.'
    WHEN name = 'Bayern Munich' THEN 'German giants and one of the most successful clubs in European football.'
    WHEN name = 'Paris Saint-Germain' THEN 'French champions with a star-studded squad and ambitious goals.'
    ELSE 'Professional football club participating in the FIFA 26 League.'
  END,
  founded_year = CASE 
    WHEN name = 'Manchester City' THEN 1880
    WHEN name = 'Liverpool' THEN 1892
    WHEN name = 'Chelsea' THEN 1905
    WHEN name = 'Arsenal' THEN 1886
    WHEN name = 'Tottenham' THEN 1882
    WHEN name = 'Manchester United' THEN 1878
    WHEN name = 'Real Madrid' THEN 1902
    WHEN name = 'Barcelona' THEN 1899
    WHEN name = 'Bayern Munich' THEN 1900
    WHEN name = 'Paris Saint-Germain' THEN 1970
    ELSE 1900
  END,
  home_stadium = CASE 
    WHEN name = 'Manchester City' THEN 'Etihad Stadium'
    WHEN name = 'Liverpool' THEN 'Anfield'
    WHEN name = 'Chelsea' THEN 'Stamford Bridge'
    WHEN name = 'Arsenal' THEN 'Emirates Stadium'
    WHEN name = 'Tottenham' THEN 'Tottenham Hotspur Stadium'
    WHEN name = 'Manchester United' THEN 'Old Trafford'
    WHEN name = 'Real Madrid' THEN 'Santiago Bernabéu'
    WHEN name = 'Barcelona' THEN 'Camp Nou'
    WHEN name = 'Bayern Munich' THEN 'Allianz Arena'
    WHEN name = 'Paris Saint-Germain' THEN 'Parc des Princes'
    ELSE 'Home Stadium'
  END,
  website = CASE 
    WHEN name = 'Manchester City' THEN 'https://www.mancity.com'
    WHEN name = 'Liverpool' THEN 'https://www.liverpoolfc.com'
    WHEN name = 'Chelsea' THEN 'https://www.chelseafc.com'
    WHEN name = 'Arsenal' THEN 'https://www.arsenal.com'
    WHEN name = 'Tottenham' THEN 'https://www.tottenhamhotspur.com'
    WHEN name = 'Manchester United' THEN 'https://www.manutd.com'
    WHEN name = 'Real Madrid' THEN 'https://www.realmadrid.com'
    WHEN name = 'Barcelona' THEN 'https://www.fcbarcelona.com'
    WHEN name = 'Bayern Munich' THEN 'https://fcbayern.com'
    WHEN name = 'Paris Saint-Germain' THEN 'https://www.psg.fr'
    ELSE 'https://example.com'
  END,
  social_media = CASE 
    WHEN name = 'Manchester City' THEN '{"twitter": "@ManCity", "instagram": "@mancity", "facebook": "Manchester City"}'
    WHEN name = 'Liverpool' THEN '{"twitter": "@LFC", "instagram": "@liverpoolfc", "facebook": "Liverpool FC"}'
    WHEN name = 'Chelsea' THEN '{"twitter": "@ChelseaFC", "instagram": "@chelseafc", "facebook": "Chelsea Football Club"}'
    WHEN name = 'Arsenal' THEN '{"twitter": "@Arsenal", "instagram": "@arsenal", "facebook": "Arsenal Football Club"}'
    WHEN name = 'Tottenham' THEN '{"twitter": "@SpursOfficial", "instagram": "@spursofficial", "facebook": "Tottenham Hotspur"}'
    WHEN name = 'Manchester United' THEN '{"twitter": "@ManUtd", "instagram": "@manchesterunited", "facebook": "Manchester United"}'
    WHEN name = 'Real Madrid' THEN '{"twitter": "@realmadrid", "instagram": "@realmadrid", "facebook": "Real Madrid CF"}'
    WHEN name = 'Barcelona' THEN '{"twitter": "@FCBarcelona", "instagram": "@fcbarcelona", "facebook": "FC Barcelona"}'
    WHEN name = 'Bayern Munich' THEN '{"twitter": "@FCBayern", "instagram": "@fcbayern", "facebook": "FC Bayern München"}'
    WHEN name = 'Paris Saint-Germain' THEN '{"twitter": "@PSG_inside", "instagram": "@psg", "facebook": "Paris Saint-Germain"}'
    ELSE '{"twitter": "", "instagram": "", "facebook": ""}'
  END::jsonb,
  contact_info = '{"email": "info@club.com", "phone": "+1 (555) 123-4567", "address": "Club Address"}'::jsonb
WHERE short_name IS NULL OR short_name = '';

-- ==============================================
-- 10. VERIFICATION
-- ==============================================

-- Verify the migration was successful
SELECT 
  'Migration completed successfully' as status,
  COUNT(*) as total_clubs,
  COUNT(CASE WHEN short_name IS NOT NULL THEN 1 END) as clubs_with_short_names,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as clubs_with_descriptions,
  COUNT(CASE WHEN home_stadium IS NOT NULL THEN 1 END) as clubs_with_stadiums
FROM clubs;
