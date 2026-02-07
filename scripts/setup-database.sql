-- Tennis Pool (Bolão de Tênis) Database Schema

-- Users table with authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  surface VARCHAR(50) NOT NULL, -- Saibro, Grama, Quadra dura
  location VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, live, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  seed INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- Matches table
-- Bracket matches table
CREATE TABLE IF NOT EXISTS bracket_matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  position INTEGER NOT NULL,
  player1_id INTEGER REFERENCES players(id),
  player2_id INTEGER REFERENCES players(id),
  winner_id INTEGER REFERENCES players(id),
  score VARCHAR(200),
  match_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  player1_type VARCHAR(20) DEFAULT 'PLAYER',
  player2_type VARCHAR(20) DEFAULT 'PLAYER',
  player1_seed INTEGER,
  player2_seed INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, round, position)
);

-- User predictions (palpites)
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bracket_match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
  predicted_winner_id INTEGER REFERENCES players(id) NOT NULL,
  is_correct BOOLEAN, -- null until match completes
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bracket_match_id)
);

-- User tournament participation
CREATE TABLE IF NOT EXISTS user_tournaments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tournament_id)
);

-- Pre-defined tournament names and locations
CREATE TABLE IF NOT EXISTS tournament_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bracket_matches_tournament ON bracket_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_round ON bracket_matches(tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(bracket_match_id);
CREATE INDEX IF NOT EXISTS idx_user_tournaments_user ON user_tournaments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tournaments_tournament ON user_tournaments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Insert sample tournaments
INSERT INTO tournaments (name, slug, surface, location, start_date, end_date, status, image_url) VALUES
('Roland Garros 2025', 'roland-garros-2025', 'Saibro', 'Paris, França', '2025-05-24', '2025-06-07', 'live', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800'),
('Wimbledon 2025', 'wimbledon-2025', 'Grama', 'Londres, Inglaterra', '2025-06-29', '2025-07-12', 'upcoming', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800'),
('US Open 2025', 'us-open-2025', 'Quadra dura', 'Nova York, EUA', '2025-08-24', '2025-09-06', 'upcoming', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800')
ON CONFLICT (slug) DO NOTHING;

-- Note: Sample matches are now typically generated via the admin interface
-- or script-based bracket generation.
