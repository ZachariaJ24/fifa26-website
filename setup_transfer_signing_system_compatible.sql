-- FIFA 26 League - Transfer and Signing System Setup (Compatible with Existing Schema)
-- This script works with your existing database structure

-- 1. Create player_transfer_offers table for transfer offers (if it doesn't exist)
CREATE TABLE IF NOT EXISTS player_transfer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    offer_amount INTEGER NOT NULL CHECK (offer_amount > 0),
    offer_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create player_signings table for direct signings (if it doesn't exist)
CREATE TABLE IF NOT EXISTS player_signings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    salary INTEGER NOT NULL CHECK (salary > 0),
    contract_length INTEGER NOT NULL DEFAULT 1 CHECK (contract_length > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add team_id column to existing player_transfers table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfers' AND column_name = 'team_id') THEN
        ALTER TABLE player_transfers ADD COLUMN team_id UUID;
    END IF;
END $$;

-- 4. Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_player_id ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_team_id ON player_transfer_offers(team_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_expires_at ON player_transfer_offers(offer_expires_at);

CREATE INDEX IF NOT EXISTS idx_player_signings_player_id ON player_signings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_team_id ON player_signings(team_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_status ON player_signings(status);

-- Add index for the new team_id column in player_transfers
CREATE INDEX IF NOT EXISTS idx_player_transfers_team_id ON player_transfers(team_id);

-- 5. Create triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_player_transfer_offers_updated_at') THEN
        CREATE TRIGGER update_player_transfer_offers_updated_at 
            BEFORE UPDATE ON player_transfer_offers 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_player_signings_updated_at') THEN
        CREATE TRIGGER update_player_signings_updated_at 
            BEFORE UPDATE ON player_signings 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 6. Create utility functions
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

-- 7. Verify the setup
SELECT 
    'Transfer and Signing System Setup Complete' as status,
    (SELECT COUNT(*) FROM player_transfer_offers) as transfer_offers_count,
    (SELECT COUNT(*) FROM player_signings) as signings_count,
    (SELECT COUNT(*) FROM player_transfers) as transfers_count,
    (SELECT column_name FROM information_schema.columns WHERE table_name = 'player_transfers' AND column_name = 'team_id') as team_id_column_exists;
