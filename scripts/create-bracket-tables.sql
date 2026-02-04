-- Athletes/Players table
CREATE TABLE IF NOT EXISTS athletes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  ranking INTEGER,
  seed INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tournament bracket entries (for the draw)
CREATE TABLE IF NOT EXISTS bracket_entries (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  athlete_id INTEGER REFERENCES athletes(id) ON DELETE SET NULL,
  position INTEGER NOT NULL, -- Position 1-128 in the bracket
  round VARCHAR(50) NOT NULL DEFAULT '1st Round', -- '1st Round', '2nd Round', '3rd Round', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'
  match_number INTEGER, -- Match number within the round
  is_winner BOOLEAN DEFAULT false,
  score VARCHAR(100), -- e.g., "6-4 6-3 7-5"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, position, round)
);

-- Index for faster bracket queries
CREATE INDEX IF NOT EXISTS idx_bracket_entries_tournament ON bracket_entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_bracket_entries_round ON bracket_entries(tournament_id, round);

-- Function to get round name based on position
-- Grand Slam structure:
-- 1st Round: 128 players (positions 1-128)
-- 2nd Round: 64 players (positions 1-64)
-- 3rd Round: 32 players (positions 1-32)
-- Round of 16: 16 players (positions 1-16)
-- Quarterfinals: 8 players (positions 1-8)
-- Semifinals: 4 players (positions 1-4)
-- Final: 2 players (positions 1-2)
