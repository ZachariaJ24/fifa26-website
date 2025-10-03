-- Clean Migration: Convert Bidding System to Transfer Signing System
-- This file only does the migration parts, not table creation

-- 1. Create utility functions for transfer management

-- Function to clean up expired transfer offers
CREATE OR REPLACE FUNCTION cleanup_expired_transfer_offers()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE player_transfer_offers 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND offer_expires_at <= NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to process accepted transfer offers
CREATE OR REPLACE FUNCTION process_accepted_transfer_offers()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    offer_record RECORD;
BEGIN
    -- Process all accepted offers
    FOR offer_record IN 
        SELECT pto.*, p.user_id, t.name as team_name
        FROM player_transfer_offers pto
        JOIN players p ON pto.player_id = p.id
        JOIN teams t ON pto.team_id = t.id
        WHERE pto.status = 'accepted'
    LOOP
        -- Update player's team and salary
        UPDATE players 
        SET team_id = offer_record.team_id, 
            salary = offer_record.offer_amount,
            updated_at = NOW()
        WHERE id = offer_record.player_id;
        
        -- Mark the transfer offer as completed
        UPDATE player_transfer_offers 
        SET status = 'completed', updated_at = NOW()
        WHERE id = offer_record.id;
        
        -- Send notification to player
        INSERT INTO notifications (user_id, title, message, link)
        SELECT 
            p.user_id,
            'Transfer Successful - You''ve Been Signed!',
            'Congratulations! You have been successfully signed to ' || offer_record.team_name || ' for $' || (offer_record.offer_amount / 1000000) || 'M.',
            '/management'
        FROM players p 
        WHERE p.id = offer_record.player_id;
        
        -- Send notification to team managers
        INSERT INTO notifications (user_id, title, message, link)
        SELECT 
            tm.user_id,
            'Transfer Successful - Player Signed',
            'You have successfully signed a new player for $' || (offer_record.offer_amount / 1000000) || 'M.',
            '/management'
        FROM team_managers tm 
        WHERE tm.team_id = offer_record.team_id;
        
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Create views for easier data access

-- View for active transfer offers with player and team details
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
ORDER BY pto.created_at DESC;

-- View for transfer history
CREATE OR REPLACE VIEW transfer_history AS
SELECT 
    pto.id,
    pto.player_id,
    pto.team_id,
    pto.offer_amount,
    pto.status,
    pto.created_at,
    pto.updated_at,
    u.gamer_tag_id as player_name,
    t.name as team_name
FROM player_transfer_offers pto
JOIN players p ON pto.player_id = p.id
JOIN teams t ON pto.team_id = t.id
LEFT JOIN users u ON p.user_id = u.id
WHERE pto.status IN ('completed', 'rejected', 'expired')
ORDER BY pto.updated_at DESC;

-- 3. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_transfer_offers_player_id ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_team_id ON player_transfer_offers(team_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_expires_at ON player_transfer_offers(offer_expires_at);

-- 4. Verify the migration setup
SELECT 
    'Migration Setup Complete' as status,
    (SELECT COUNT(*) FROM player_transfer_offers) as transfer_offers_count,
    (SELECT COUNT(*) FROM player_signings) as signings_count,
    (SELECT COUNT(*) FROM player_transfers) as transfers_count,
    (SELECT COUNT(*) FROM active_transfer_offers) as active_offers_count;
