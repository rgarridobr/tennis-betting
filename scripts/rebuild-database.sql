-- REBUILD DATABASE: Keep users and sessions, recreate everything else
-- Grand Slam bracket system with 128 players elimination format

-- Drop old tables
DROP TABLE IF EXISTS bracket_entries CASCADE;
DROP TABLE IF EXISTS athletes CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS user_tournaments CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Tournaments table (Grand Slams)
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surface VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date DATE NOT NULL,
  image_url VARCHAR(500),
  prize_description TEXT,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players registered in the system
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  seed INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_players_name ON players(name);

-- Pre-defined tournament names and locations
CREATE TABLE tournament_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE tournament_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Seed some initial data
INSERT INTO tournament_names (name) VALUES
('Australian Open'), ('Roland Garros'), ('Wimbledon'), ('US Open'),
('Indian Wells Masters'), ('Miami Open'), ('Monte-Carlo Masters'), ('Madrid Open'),
('Italian Open'), ('Canadian Open'), ('Cincinnati Masters'), ('Shanghai Masters'),
('Paris Masters'), ('ATP Finals')
ON CONFLICT DO NOTHING;

INSERT INTO tournament_locations (name) VALUES
('Melbourne, Austrália'), ('Paris, França'), ('Londres, Inglaterra'), ('Nova York, EUA'),
('Indian Wells, EUA'), ('Miami, EUA'), ('Monte Carlo, Mônaco'), ('Madri, Espanha'),
('Roma, Itália'), ('Montreal/Toronto, Canadá'), ('Cincinnati, EUA'), ('Xangai, China'),
('Paris, França'), ('Turim, Itália')
ON CONFLICT DO NOTHING;

-- Bracket matches: each row = 1 match in the bracket
-- round: 1=1st Round, 2=2nd Round, 3=3rd Round, 4=Oitavas, 5=Quartas, 6=Semi, 7=Final
-- position: 1..64 for round 1, 1..32 for round 2, etc.
CREATE TABLE bracket_matches (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, round, position)
);

-- User tournament enrollment
CREATE TABLE user_tournaments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) DEFAULT 'paid',
  bracket_submitted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tournament_id)
);

-- Predictions: user predicts winner of a bracket match
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bracket_match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
  predicted_winner_id INTEGER REFERENCES players(id) NOT NULL,
  predicted_score VARCHAR(20),
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bracket_match_id)
);

-- Indexes
CREATE INDEX idx_bracket_matches_tournament ON bracket_matches(tournament_id);
CREATE INDEX idx_bracket_matches_round ON bracket_matches(tournament_id, round);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(bracket_match_id);
CREATE INDEX idx_user_tournaments_user ON user_tournaments(user_id);
