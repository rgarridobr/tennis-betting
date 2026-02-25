-- Migration to support full bracket predictions and new scoring

-- 1. Update tournaments table to include missing columns and change start_date type
DO $$
BEGIN
    -- Change start_date to TIMESTAMP
    ALTER TABLE tournaments ALTER COLUMN start_date TYPE TIMESTAMP;

    -- Add category and related columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='category') THEN
        ALTER TABLE tournaments ADD COLUMN category VARCHAR(100) DEFAULT 'GRAND_SLAM';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='category_custom') THEN
        ALTER TABLE tournaments ADD COLUMN category_custom VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='format') THEN
        ALTER TABLE tournaments ADD COLUMN format VARCHAR(50) DEFAULT 'SIMPLES';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='sets_format') THEN
        ALTER TABLE tournaments ADD COLUMN sets_format INTEGER DEFAULT 3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='size') THEN
        ALTER TABLE tournaments ADD COLUMN size INTEGER DEFAULT 128;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='has_seeds') THEN
        ALTER TABLE tournaments ADD COLUMN has_seeds BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='has_qualifiers') THEN
        ALTER TABLE tournaments ADD COLUMN has_qualifiers BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='has_wildcards') THEN
        ALTER TABLE tournaments ADD COLUMN has_wildcards BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='has_byes') THEN
        ALTER TABLE tournaments ADD COLUMN has_byes BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='champion_id') THEN
        ALTER TABLE tournaments ADD COLUMN champion_id INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tournaments' AND column_name='runner_up_id') THEN
        ALTER TABLE tournaments ADD COLUMN runner_up_id INTEGER;
    END IF;

    -- Update bracket_matches missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bracket_matches' AND column_name='player1_type') THEN
        ALTER TABLE bracket_matches ADD COLUMN player1_type VARCHAR(50) DEFAULT 'PLAYER';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bracket_matches' AND column_name='player2_type') THEN
        ALTER TABLE bracket_matches ADD COLUMN player2_type VARCHAR(50) DEFAULT 'PLAYER';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bracket_matches' AND column_name='player1_seed') THEN
        ALTER TABLE bracket_matches ADD COLUMN player1_seed INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bracket_matches' AND column_name='player2_seed') THEN
        ALTER TABLE bracket_matches ADD COLUMN player2_seed INTEGER;
    END IF;

    -- Update user_tournaments to include bracket submission status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_tournaments' AND column_name='bracket_submitted') THEN
        ALTER TABLE user_tournaments ADD COLUMN bracket_submitted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Update predictions table to include predicted score (for final match)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='predicted_score') THEN
        ALTER TABLE predictions ADD COLUMN predicted_score VARCHAR(20);
    END IF;
END $$;

-- 4. Drop bonus_predictions table as it's no longer needed
DROP TABLE IF EXISTS bonus_predictions CASCADE;
