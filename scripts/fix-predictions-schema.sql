-- Migration to fix predictions table schema
-- This script ensures the predictions table correctly references bracket_matches instead of the legacy matches table.
-- Wrapped in a transaction for safety.

BEGIN;

DO $$
BEGIN
    -- 1. Rename column match_id to bracket_match_id if it still exists (legacy support)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='match_id') THEN
        RAISE NOTICE 'Renaming match_id to bracket_match_id in predictions table';
        ALTER TABLE predictions RENAME COLUMN match_id TO bracket_match_id;
    END IF;

    -- 2. Handle predicted_winner (string) to predicted_winner_id (integer) migration if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='predicted_winner')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='predicted_winner_id') THEN

        RAISE NOTICE 'Migrating predicted_winner to predicted_winner_id';
        ALTER TABLE predictions ADD COLUMN predicted_winner_id INTEGER;

        -- Attempt to preserve existing data by matching player names if players table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='players') THEN
            UPDATE predictions p
            SET predicted_winner_id = pl.id
            FROM players pl
            WHERE p.predicted_winner = pl.name;
        END IF;

        -- Drop the old column to avoid NOT NULL constraint issues with new code
        ALTER TABLE predictions DROP COLUMN predicted_winner;
    END IF;

    -- 3. Ensure predicted_winner_id is NOT NULL if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='predicted_winner_id') THEN
        ALTER TABLE predictions ALTER COLUMN predicted_winner_id SET NOT NULL;
    END IF;
END $$;

-- 4. Drop the incorrect foreign key constraint reported in the error
-- The error message confirmed it's named 'predictions_match_id_fkey' and points to 'matches'
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_match_id_fkey;

-- 5. Add the correct foreign key constraint pointing to bracket_matches
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_bracket_match_id_fkey;
ALTER TABLE predictions
ADD CONSTRAINT predictions_bracket_match_id_fkey
FOREIGN KEY (bracket_match_id) REFERENCES bracket_matches(id) ON DELETE CASCADE;

-- 6. Ensure predicted_winner_id has the correct foreign key to players if both exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='predictions' AND column_name='predicted_winner_id')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='players') THEN

        ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_predicted_winner_id_fkey;
        ALTER TABLE predictions
        ADD CONSTRAINT predictions_predicted_winner_id_fkey
        FOREIGN KEY (predicted_winner_id) REFERENCES players(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Update Unique Constraint
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_match_id_key;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_bracket_match_id_key;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='predictions_user_id_bracket_match_id_key') THEN
        ALTER TABLE predictions ADD CONSTRAINT predictions_user_id_bracket_match_id_key UNIQUE (user_id, bracket_match_id);
    END IF;
END $$;

-- 8. Update Index
DROP INDEX IF EXISTS idx_predictions_match;
CREATE INDEX IF NOT EXISTS idx_predictions_bracket_match ON predictions(bracket_match_id);

COMMIT;
