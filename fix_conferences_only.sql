-- Simple script to fix conference assignments only
-- This will resolve the "No Conference" issue without touching other systems

-- ==============================================
-- 1. CREATE CONFERENCES IF THEY DON'T EXIST
-- ==============================================

-- Create conferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert conferences if they don't exist
INSERT INTO conferences (name, description, color) VALUES
('Eastern Conference', 'Teams from the eastern region', '#3B82F6'),
('Western Conference', 'Teams from the western region', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- 2. ADD CONFERENCE COLUMN TO TEAMS IF MISSING
-- ==============================================

-- Add conference_id column to teams table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'conference_id') THEN
    ALTER TABLE teams ADD COLUMN conference_id UUID REFERENCES conferences(id);
  END IF;
END $$;

-- ==============================================
-- 3. ASSIGN TEAMS TO CONFERENCES
-- ==============================================

-- Update teams to have proper conference assignments
-- Eastern Conference Teams
UPDATE teams SET 
  conference_id = (SELECT id FROM conferences WHERE name = 'Eastern Conference'),
  updated_at = NOW()
WHERE name IN (
  'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham',
  'Newcastle', 'Brighton', 'West Ham', 'Aston Villa', 'Crystal Palace'
);

-- Western Conference Teams  
UPDATE teams SET 
  conference_id = (SELECT id FROM conferences WHERE name = 'Western Conference'),
  updated_at = NOW()
WHERE name IN (
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Bayern Munich', 'Borussia Dortmund',
  'Paris Saint-Germain', 'Juventus', 'AC Milan', 'Inter Milan', 'Napoli'
);

-- ==============================================
-- 4. VERIFY THE RESULTS
-- ==============================================

-- Show conferences
SELECT 'CONFERENCES CREATED' as section;
SELECT id, name, color, is_active FROM conferences ORDER BY name;

-- Show teams with conference assignments
SELECT 'TEAMS WITH CONFERENCES' as section;
SELECT 
  t.id,
  t.name,
  c.name as conference_name,
  c.color as conference_color
FROM teams t
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY c.name, t.name;

-- Show any teams still without conferences
SELECT 'TEAMS WITHOUT CONFERENCES' as section;
SELECT 
  t.id,
  t.name
FROM teams t
WHERE t.is_active = true 
  AND t.conference_id IS NULL;

-- Show summary
SELECT 'SUMMARY' as section;
SELECT 
  'Total Teams' as metric, COUNT(*) as count FROM teams WHERE is_active = true
UNION ALL
SELECT 
  'Teams with Conferences' as metric, COUNT(*) as count FROM teams WHERE is_active = true AND conference_id IS NOT NULL
UNION ALL
SELECT 
  'Teams without Conferences' as metric, COUNT(*) as count FROM teams WHERE is_active = true AND conference_id IS NULL
UNION ALL
SELECT 
  'Total Conferences' as metric, COUNT(*) as count FROM conferences WHERE is_active = true;
