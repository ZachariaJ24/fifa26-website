-- FIFA 26 League - Transfer and Signing System Setup
-- This script sets up the complete transfer and signing system

-- 1. Create player_transfer_offers table for transfer offers
CREATE TABLE IF NOT EXISTS player_transfer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    offer_amount INTEGER NOT NULL CHECK (offer_amount > 0),
    offer_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create player_signings table for direct signings
CREATE TABLE IF NOT EXISTS player_signings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    salary INTEGER NOT NULL CHECK (salary > 0),
    contract_length INTEGER NOT NULL DEFAULT 1 CHECK (contract_length > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create player_transfers table (replaces old player_bidding)
CREATE TABLE IF NOT EXISTS player_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    transfer_amount INTEGER NOT NULL CHECK (transfer_amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired', 'manually_assigned')),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_player_id ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_team_id ON player_transfer_offers(team_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_expires_at ON player_transfer_offers(offer_expires_at);

CREATE INDEX IF NOT EXISTS idx_player_signings_player_id ON player_signings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_team_id ON player_signings(team_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_status ON player_signings(status);

CREATE INDEX IF NOT EXISTS idx_player_transfers_player_id ON player_transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_transfers_team_id ON player_transfers(team_id);
CREATE INDEX IF NOT EXISTS idx_player_transfers_status ON player_transfers(status);

-- 5. Create triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_transfer_offers_updated_at 
    BEFORE UPDATE ON player_transfer_offers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_signings_updated_at 
    BEFORE UPDATE ON player_signings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_transfers_updated_at 
    BEFORE UPDATE ON player_transfers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Set up Row Level Security (RLS) policies
ALTER TABLE player_transfer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_signings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_transfers ENABLE ROW LEVEL SECURITY;

-- Policies for player_transfer_offers
CREATE POLICY "Allow authenticated users to read transfer offers" ON player_transfer_offers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team owners to create transfer offers" ON player_transfer_offers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_transfer_offers.player_id 
            AND players.team_id = auth.uid()
        )
    );

CREATE POLICY "Allow team owners to update their transfer offers" ON player_transfer_offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_transfer_offers.player_id 
            AND players.team_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to manage all transfer offers" ON player_transfer_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies for player_signings
CREATE POLICY "Allow authenticated users to read signings" ON player_signings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team owners to create signings" ON player_signings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_signings.player_id 
            AND players.team_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to manage all signings" ON player_signings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies for player_transfers
CREATE POLICY "Allow authenticated users to read transfers" ON player_transfers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team owners to create transfers" ON player_transfers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM players 
            WHERE players.id = player_transfers.player_id 
            AND players.team_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to manage all transfers" ON player_transfers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 7. Grant necessary permissions
GRANT SELECT ON player_transfer_offers TO authenticated;
GRANT SELECT ON player_signings TO authenticated;
GRANT SELECT ON player_transfers TO authenticated;
GRANT ALL ON player_transfer_offers TO service_role;
GRANT ALL ON player_signings TO service_role;
GRANT ALL ON player_transfers TO service_role;

-- 8. Update system settings for transfer and signing system
INSERT INTO system_settings (key, value, description) VALUES
('transfer_market_enabled', 'true', 'Controls whether the player transfer market is open or closed'),
('signings_enabled', 'true', 'Controls whether direct player signings are open or closed'),
('transfer_offer_duration', '14400', 'Duration of transfer offers in seconds (default: 4 hours)'),
('transfer_increment', '2000000', 'Minimum increment for transfer offers'),
('min_salary', '750000', 'Minimum salary for players'),
('max_salary', '15000000', 'Maximum salary for players')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- 9. Create a function to clean up expired transfer offers
CREATE OR REPLACE FUNCTION cleanup_expired_transfer_offers()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE player_transfer_offers 
    SET status = 'expired'
    WHERE status = 'active' 
    AND offer_expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Create a function to get transfer recap data
CREATE OR REPLACE FUNCTION get_transfer_recap_data()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_transfers', (SELECT COUNT(*) FROM player_transfers WHERE status = 'completed'),
        'total_signings', (SELECT COUNT(*) FROM player_signings WHERE status = 'completed'),
        'active_offers', (SELECT COUNT(*) FROM player_transfer_offers WHERE status = 'active'),
        'pending_signings', (SELECT COUNT(*) FROM player_signings WHERE status = 'pending'),
        'total_teams', (SELECT COUNT(*) FROM teams WHERE is_active = true),
        'total_players', (SELECT COUNT(*) FROM players WHERE role = 'Player')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Verify the setup
SELECT 
    'Transfer and Signing System Setup Complete' as status,
    (SELECT COUNT(*) FROM player_transfer_offers) as transfer_offers_count,
    (SELECT COUNT(*) FROM player_signings) as signings_count,
    (SELECT COUNT(*) FROM player_transfers) as transfers_count;
