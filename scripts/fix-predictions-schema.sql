-- Comprehensive migration to synchronize database schema with current codebase

-- 1. Handle matches -> bracket_matches table rename if necessary
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bracket_matches') THEN
    ALTER TABLE matches RENAME TO bracket_matches;
    RAISE NOTICE 'Renamed table matches to bracket_matches';
  END IF;
END $$;

-- 2. Ensure bracket_matches has the correct structure expected by the code
DO $$
BEGIN
  -- Change round from VARCHAR to INTEGER if it's still VARCHAR
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'round' AND data_type = 'character varying') THEN
    ALTER TABLE bracket_matches ALTER COLUMN round TYPE INTEGER USING (
      CASE
        WHEN round ILIKE '%Final%' AND round NOT ILIKE '%Semi%' AND round NOT ILIKE '%Quarta%' THEN 7
        WHEN round ILIKE '%Semi%' THEN 6
        WHEN round ILIKE '%Quarta%' THEN 5
        WHEN round ILIKE '%Oitava%' OR round ILIKE '%16%' THEN 4
        WHEN round ILIKE '%3a%' OR round ILIKE '%3rd%' THEN 3
        WHEN round ILIKE '%2a%' OR round ILIKE '%2nd%' THEN 2
        WHEN round ILIKE '%1a%' OR round ILIKE '%1st%' THEN 1
        ELSE 1
      END
    );
    RAISE NOTICE 'Converted bracket_matches.round to INTEGER';
  END IF;

  -- Add missing columns to bracket_matches if they were not in the old 'matches' table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'position') THEN
    ALTER TABLE bracket_matches ADD COLUMN position INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player1_id') THEN
    ALTER TABLE bracket_matches ADD COLUMN player1_id INTEGER REFERENCES players(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player2_id') THEN
    ALTER TABLE bracket_matches ADD COLUMN player2_id INTEGER REFERENCES players(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'winner_id') THEN
    ALTER TABLE bracket_matches ADD COLUMN winner_id INTEGER REFERENCES players(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player1_type') THEN
    ALTER TABLE bracket_matches ADD COLUMN player1_type VARCHAR(20) DEFAULT 'PLAYER';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player2_type') THEN
    ALTER TABLE bracket_matches ADD COLUMN player2_type VARCHAR(20) DEFAULT 'PLAYER';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player1_seed') THEN
    ALTER TABLE bracket_matches ADD COLUMN player1_seed INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bracket_matches' AND column_name = 'player2_seed') THEN
    ALTER TABLE bracket_matches ADD COLUMN player2_seed INTEGER;
  END IF;
END $$;

-- 3. Fix predictions table
DO $$
BEGIN
  -- Rename match_id to bracket_match_id if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'match_id') THEN
    ALTER TABLE predictions RENAME COLUMN match_id TO bracket_match_id;
    RAISE NOTICE 'Renamed predictions.match_id to bracket_match_id';
  END IF;

  -- Handle predicted_winner (VARCHAR) -> predicted_winner_id (INTEGER)
  -- Check if predicted_winner exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'predicted_winner') THEN
    -- If predicted_winner_id doesn't exist yet, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'predicted_winner_id') THEN
      ALTER TABLE predictions ADD COLUMN predicted_winner_id INTEGER;

      -- Try to backfill predicted_winner_id from players table using predicted_winner names
      UPDATE predictions p
      SET predicted_winner_id = pl.id
      FROM players pl
      WHERE p.predicted_winner = pl.name;

      RAISE NOTICE 'Created predicted_winner_id and attempted to backfill from player names';
    END IF;

    -- Now we can safely drop predicted_winner or keep it. Let's keep it for safety during migration.
  END IF;

  -- Ensure predicted_winner_id exists and is INTEGER
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'predicted_winner_id') THEN
    ALTER TABLE predictions ADD COLUMN predicted_winner_id INTEGER;
  END IF;

  -- If predicted_winner_id is VARCHAR (due to a previous failed rename attempt), convert it
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'predicted_winner_id' AND data_type = 'character varying') THEN
      ALTER TABLE predictions ALTER COLUMN predicted_winner_id TYPE INTEGER USING (
        CASE WHEN predicted_winner_id ~ '^[0-9]+$' THEN predicted_winner_id::integer ELSE NULL END
      );
      RAISE NOTICE 'Converted predicted_winner_id from VARCHAR to INTEGER';
  END IF;
END $$;

-- 4. Update constraints and indexes
DO $$
BEGIN
    -- Drop old constraints
    ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_match_id_key;
    ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_bracket_match_id_key;

    -- Add the correct constraint
    -- Note: We only add NOT NULL if we're sure there's data or it's empty
    -- For safety, we'll just ensure the unique constraint is there
    ALTER TABLE predictions ADD CONSTRAINT predictions_user_id_bracket_match_id_key UNIQUE (user_id, bracket_match_id);

    RAISE NOTICE 'Updated unique constraints on predictions table';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Constraint update noticed an issue (possibly already correct): %', SQLERRM;
END $$;

-- 5. Final index update
DROP INDEX IF EXISTS idx_predictions_match;
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(bracket_match_id);
