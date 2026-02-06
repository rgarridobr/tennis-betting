-- Update tournaments table with new configuration fields
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS bracket_size INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS seeds_count INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS byes_count INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS direct_entries_count INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS qualifiers_count INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS wildcards_count INTEGER;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS draw_random_seed VARCHAR(255);
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS draw_generated_at TIMESTAMP;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS ranking_id INTEGER;

-- Create rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create player_rankings table
CREATE TABLE IF NOT EXISTS player_rankings (
  ranking_id INTEGER REFERENCES rankings(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL,
  PRIMARY KEY (ranking_id, player_id)
);

-- Create tournament_entries table
CREATE TABLE IF NOT EXISTS tournament_entries (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  entry_type VARCHAR(50) NOT NULL, -- ENTRY_DIRECT, ENTRY_SEED, ENTRY_QUALIFIER, ENTRY_WILDCARD, ENTRY_SPECIAL_EXEMPT, ENTRY_LUCKY_LOSER
  ranking_at_cutoff INTEGER,
  points_at_cutoff INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, player_id)
);

-- Add ranking_id foreign key constraint to tournaments if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tournaments_ranking') THEN
        ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_ranking FOREIGN KEY (ranking_id) REFERENCES rankings(id) ON DELETE SET NULL;
    END IF;
END $$;
