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

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  round VARCHAR(100) NOT NULL, -- Final, Semifinal, Quartas, Oitavas, etc.
  player1_name VARCHAR(255) NOT NULL,
  player1_country VARCHAR(100),
  player2_name VARCHAR(255) NOT NULL,
  player2_country VARCHAR(100),
  match_date TIMESTAMP NOT NULL,
  winner VARCHAR(255), -- player1_name or player2_name after match completes
  score VARCHAR(100), -- e.g., "6-4, 7-5, 6-3"
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User predictions (palpites)
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  predicted_winner VARCHAR(255) NOT NULL,
  is_correct BOOLEAN, -- null until match completes
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, match_id)
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
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
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

-- Insert sample matches for Roland Garros
INSERT INTO matches (tournament_id, round, player1_name, player1_country, player2_name, player2_country, match_date, status) VALUES
((SELECT id FROM tournaments WHERE slug = 'roland-garros-2025'), 'Oitavas de Final', 'Carlos Alcaraz', 'Espanha', 'Stefanos Tsitsipas', 'Grécia', '2025-06-01 14:00:00', 'scheduled'),
((SELECT id FROM tournaments WHERE slug = 'roland-garros-2025'), 'Oitavas de Final', 'Jannik Sinner', 'Itália', 'Daniil Medvedev', 'Rússia', '2025-06-01 16:00:00', 'scheduled'),
((SELECT id FROM tournaments WHERE slug = 'roland-garros-2025'), 'Oitavas de Final', 'Novak Djokovic', 'Sérvia', 'Alexander Zverev', 'Alemanha', '2025-06-02 14:00:00', 'scheduled'),
((SELECT id FROM tournaments WHERE slug = 'roland-garros-2025'), 'Oitavas de Final', 'Rafael Nadal', 'Espanha', 'Casper Ruud', 'Noruega', '2025-06-02 16:00:00', 'scheduled')
ON CONFLICT DO NOTHING;
