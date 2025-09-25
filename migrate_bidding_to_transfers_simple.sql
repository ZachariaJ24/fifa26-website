-- Simple Migration: Convert Bidding System to Transfer Signing System
-- Run this in your Supabase SQL Editor

-- 1. Create the new transfer offers table
CREATE TABLE IF NOT EXISTS player_transfer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    offer_amount INTEGER NOT NULL CHECK (offer_amount > 0),
    offer_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transfer_offers_player_id ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_team_id ON player_transfer_offers(team_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_expires_at ON player_transfer_offers(offer_expires_at);

-- 3. Create a view for active transfer offers
CREATE OR REPLACE VIEW active_transfer_offers AS
SELECT 
    pto.id,
    pto.player_id,
    pto.team_id,
    pto.offer_amount,
    pto.offer_expires_at,
    pto.created_at,
    u.gamer_tag_id as player_name,
    p.user_id as player_user_id,
    t.name as team_name,
    t.logo_url as team_logo_url,
    u.gamer_tag_id as player_gamer_tag
FROM player_transfer_offers pto
JOIN players p ON pto.player_id = p.id
JOIN teams t ON pto.team_id = t.id
LEFT JOIN users u ON p.user_id = u.id
WHERE pto.status = 'active' 
AND pto.offer_expires_at > NOW()
ORDER BY pto.offer_amount DESC, pto.created_at ASC;

-- 4. Create a function to get the highest offer for each player
CREATE OR REPLACE FUNCTION get_highest_transfer_offers()
RETURNS TABLE (
    player_id UUID,
    player_name VARCHAR(100),
    highest_offer_amount INTEGER,
    offering_team_name VARCHAR(100),
    offer_expires_at TIMESTAMP WITH TIME ZONE,
    total_offers INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH highest_offers AS (
        SELECT 
            pto.player_id,
            MAX(pto.offer_amount) as max_amount
        FROM player_transfer_offers pto
        WHERE pto.status = 'active' 
        AND pto.offer_expires_at > NOW()
        GROUP BY pto.player_id
    ),
    offer_details AS (
        SELECT 
            pto.player_id,
            pto.offer_amount,
            pto.offer_expires_at,
            t.name as team_name,
            u.gamer_tag_id as player_name,
            COUNT(*) OVER (PARTITION BY pto.player_id) as total_offers
        FROM player_transfer_offers pto
        JOIN highest_offers ho ON pto.player_id = ho.player_id AND pto.offer_amount = ho.max_amount
        JOIN teams t ON pto.team_id = t.id
        JOIN players p ON pto.player_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE pto.status = 'active' 
        AND pto.offer_expires_at > NOW()
    )
    SELECT 
        od.player_id,
        od.player_name,
        od.offer_amount,
        od.team_name,
        od.offer_expires_at,
        od.total_offers
    FROM offer_details od
    ORDER BY od.offer_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to process expired offers
CREATE OR REPLACE FUNCTION process_expired_transfer_offers()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    offer_record RECORD;
BEGIN
    -- Mark expired offers as expired
    UPDATE player_transfer_offers 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND offer_expires_at <= NOW();
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    
    -- For each expired offer, assign the player to the highest bidding team
    FOR offer_record IN 
        SELECT DISTINCT ON (player_id) 
            player_id, team_id, offer_amount
        FROM player_transfer_offers 
        WHERE status = 'expired'
        ORDER BY player_id, offer_amount DESC, created_at ASC
    LOOP
        -- Update player's team and salary
        UPDATE players 
        SET team_id = offer_record.team_id, 
            salary = offer_record.offer_amount,
            updated_at = NOW()
        WHERE id = offer_record.player_id;
        
        -- Send notification to player
        INSERT INTO notifications (user_id, title, message, link)
        SELECT 
            p.user_id,
            'Transfer Successful - You''ve Been Signed!',
            'Congratulations! You have been successfully signed by ' || t.name || ' for $' || offer_record.offer_amount::TEXT || '.',
            '/profile'
        FROM players p
        JOIN teams t ON offer_record.team_id = t.id
        WHERE p.id = offer_record.player_id;
        
        -- Send notification to team managers
        INSERT INTO notifications (user_id, title, message, link)
        SELECT 
            p.user_id,
            'Transfer Successful - Player Signed',
            'Your team has successfully signed ' || COALESCE(u.gamer_tag_id, 'a player') || ' for $' || offer_record.offer_amount::TEXT || '.',
            '/management'
        FROM players p
        JOIN users u ON p.user_id = u.id
        WHERE p.team_id = offer_record.team_id
        AND p.role IN ('GM', 'AGM', 'Owner');
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_transfer_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transfer_offers_updated_at 
    BEFORE UPDATE ON player_transfer_offers 
    FOR EACH ROW EXECUTE FUNCTION update_transfer_offers_updated_at();

-- 7. Verify the setup
SELECT 
    'Transfer System Setup Complete' as status,
    COUNT(*) as total_transfer_offers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_offers,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_offers
FROM player_transfer_offers;

-- Show the active transfer offers (will be empty initially)
SELECT * FROM active_transfer_offers LIMIT 10;
