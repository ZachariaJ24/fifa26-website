-- Transfer Signing System - Complete Implementation
-- Run this in your Supabase SQL Editor

-- 1. Create a function to automatically process expired offers and sign players
CREATE OR REPLACE FUNCTION process_transfer_signings()
RETURNS TABLE (
    processed_offers INTEGER,
    signed_players INTEGER,
    notifications_sent INTEGER
) AS $$
DECLARE
    offer_record RECORD;
    processed_count INTEGER := 0;
    signed_count INTEGER := 0;
    notification_count INTEGER := 0;
BEGIN
    -- Process all expired offers
    FOR offer_record IN 
        SELECT DISTINCT ON (player_id) 
            player_id, 
            team_id, 
            offer_amount,
            id as offer_id
        FROM player_transfer_offers 
        WHERE status = 'active' 
        AND offer_expires_at <= NOW()
        ORDER BY player_id, offer_amount DESC, created_at ASC
    LOOP
        -- Mark the offer as processed
        UPDATE player_transfer_offers 
        SET status = 'accepted', updated_at = NOW()
        WHERE id = offer_record.offer_id;
        
        processed_count := processed_count + 1;
        
        -- Sign the player to the team
        UPDATE players 
        SET 
            team_id = offer_record.team_id, 
            salary = offer_record.offer_amount,
            updated_at = NOW()
        WHERE id = offer_record.player_id 
        AND team_id IS NULL; -- Only sign if player is still a free agent
        
        -- Check if player was actually signed
        IF FOUND THEN
            signed_count := signed_count + 1;
            
            -- Send notification to the player
            INSERT INTO notifications (user_id, title, message, link)
            SELECT 
                p.user_id,
                'Transfer Successful - You''ve Been Signed!',
                'Congratulations! You have been successfully signed by ' || t.name || ' for $' || offer_record.offer_amount::TEXT || '.',
                '/profile'
            FROM players p
            JOIN teams t ON offer_record.team_id = t.id
            WHERE p.id = offer_record.player_id;
            
            notification_count := notification_count + 1;
            
            -- Send notification to team managers (GM, AGM, Owner)
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
            
            notification_count := notification_count + 1;
        END IF;
        
        -- Mark all other offers for this player as rejected
        UPDATE player_transfer_offers 
        SET status = 'rejected', updated_at = NOW()
        WHERE player_id = offer_record.player_id 
        AND id != offer_record.offer_id
        AND status = 'active';
    END LOOP;
    
    RETURN QUERY SELECT processed_count, signed_count, notification_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function to get transfer statistics
CREATE OR REPLACE FUNCTION get_transfer_statistics()
RETURNS TABLE (
    total_offers INTEGER,
    active_offers INTEGER,
    completed_transfers INTEGER,
    total_value BIGINT,
    average_offer_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_offers,
        COUNT(CASE WHEN status = 'active' AND offer_expires_at > NOW() THEN 1 END)::INTEGER as active_offers,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::INTEGER as completed_transfers,
        SUM(CASE WHEN status = 'accepted' THEN offer_amount ELSE 0 END) as total_value,
        ROUND(AVG(CASE WHEN status = 'accepted' THEN offer_amount ELSE NULL END), 2) as average_offer_amount
    FROM player_transfer_offers;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function to get team transfer activity
CREATE OR REPLACE FUNCTION get_team_transfer_activity(team_uuid UUID)
RETURNS TABLE (
    team_name VARCHAR(100),
    offers_made INTEGER,
    players_signed INTEGER,
    total_spent BIGINT,
    active_offers INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as team_name,
        COUNT(pto.id)::INTEGER as offers_made,
        COUNT(CASE WHEN pto.status = 'accepted' THEN 1 END)::INTEGER as players_signed,
        SUM(CASE WHEN pto.status = 'accepted' THEN pto.offer_amount ELSE 0 END) as total_spent,
        COUNT(CASE WHEN pto.status = 'active' AND pto.offer_expires_at > NOW() THEN 1 END)::INTEGER as active_offers
    FROM teams t
    LEFT JOIN player_transfer_offers pto ON t.id = pto.team_id
    WHERE t.id = team_uuid
    GROUP BY t.id, t.name;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a function to get player transfer history
CREATE OR REPLACE FUNCTION get_player_transfer_history(player_uuid UUID)
RETURNS TABLE (
    player_name VARCHAR(100),
    total_offers INTEGER,
    highest_offer BIGINT,
    final_team VARCHAR(100),
    transfer_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.gamer_tag_id as player_name,
        COUNT(pto.id)::INTEGER as total_offers,
        MAX(pto.offer_amount) as highest_offer,
        t.name as final_team,
        p.updated_at as transfer_date
    FROM players p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN player_transfer_offers pto ON p.id = pto.player_id
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.id = player_uuid
    GROUP BY p.id, u.gamer_tag_id, t.name, p.updated_at;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a view for current transfer market status
CREATE OR REPLACE VIEW transfer_market_status AS
SELECT 
    'Total Offers' as metric,
    COUNT(*)::TEXT as value
FROM player_transfer_offers
UNION ALL
SELECT 
    'Active Offers' as metric,
    COUNT(*)::TEXT as value
FROM player_transfer_offers
WHERE status = 'active' AND offer_expires_at > NOW()
UNION ALL
SELECT 
    'Completed Transfers' as metric,
    COUNT(*)::TEXT as value
FROM player_transfer_offers
WHERE status = 'accepted'
UNION ALL
SELECT 
    'Total Transfer Value' as metric,
    '$' || SUM(offer_amount)::TEXT as value
FROM player_transfer_offers
WHERE status = 'accepted';

-- 6. Create a view for recent transfer activity
CREATE OR REPLACE VIEW recent_transfer_activity AS
SELECT 
    pto.id as offer_id,
    u.gamer_tag_id as player_name,
    t.name as team_name,
    pto.offer_amount,
    pto.created_at as offer_date,
    pto.offer_expires_at,
    pto.status,
    CASE 
        WHEN pto.status = 'active' AND pto.offer_expires_at > NOW() THEN 'Active'
        WHEN pto.status = 'accepted' THEN 'Completed'
        WHEN pto.status = 'rejected' THEN 'Rejected'
        WHEN pto.status = 'active' AND pto.offer_expires_at <= NOW() THEN 'Expired'
        ELSE 'Unknown'
    END as status_display
FROM player_transfer_offers pto
JOIN players p ON pto.player_id = p.id
LEFT JOIN users u ON p.user_id = u.id
JOIN teams t ON pto.team_id = t.id
ORDER BY pto.created_at DESC
LIMIT 50;

-- 7. Create a trigger to automatically process expired offers every hour
-- Note: This would typically be handled by a cron job or scheduled function
-- For now, we'll create a manual trigger function

CREATE OR REPLACE FUNCTION check_and_process_expired_offers()
RETURNS VOID AS $$
DECLARE
    result RECORD;
BEGIN
    -- Process expired offers
    SELECT * INTO result FROM process_transfer_signings();
    
    -- Log the results (you can remove this in production)
    RAISE NOTICE 'Processed % offers, signed % players, sent % notifications', 
        result.processed_offers, result.signed_players, result.notifications_sent;
END;
$$ LANGUAGE plpgsql;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transfer_offers_expired ON player_transfer_offers(offer_expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_transfer_offers_player_status ON player_transfer_offers(player_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_team_status ON player_transfer_offers(team_id, status);

-- 9. Test the system
SELECT 'Transfer Signing System Setup Complete' as status;

-- Show current transfer statistics
SELECT * FROM get_transfer_statistics();

-- Show transfer market status
SELECT * FROM transfer_market_status;

-- Show recent activity (will be empty initially)
SELECT * FROM recent_transfer_activity LIMIT 10;
