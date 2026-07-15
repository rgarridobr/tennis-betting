-- Full local schema for Tennis Betting Platform (dev)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  nickname TEXT,
  whatsapp VARCHAR(20),
  tennis_club VARCHAR(255),
  tennis_club_id INTEGER,
  tennis_club_custom VARCHAR(255),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tennis_clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tennis_club_id_fkey;
ALTER TABLE users
  ADD CONSTRAINT users_tennis_club_id_fkey
  FOREIGN KEY (tennis_club_id) REFERENCES tennis_clubs(id);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(5) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_concepts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  surface VARCHAR(50),
  default_country VARCHAR(100),
  default_city VARCHAR(100),
  sets_format INTEGER,
  draw_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  seed INTEGER,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name ON players(name);

CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  surface VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date DATE NOT NULL,
  image_url VARCHAR(500),
  prize_description TEXT,
  status VARCHAR(50) DEFAULT 'upcoming',
  category VARCHAR(50) DEFAULT 'GRAND_SLAM',
  category_custom VARCHAR(255),
  format VARCHAR(50) DEFAULT 'SIMPLES',
  sets_format INTEGER DEFAULT 3,
  size INTEGER DEFAULT 128,
  has_seeds BOOLEAN DEFAULT TRUE,
  has_qualifiers BOOLEAN DEFAULT TRUE,
  has_wildcards BOOLEAN DEFAULT TRUE,
  has_byes BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  champion_id INTEGER REFERENCES players(id),
  runner_up_id INTEGER REFERENCES players(id),
  tournament_concept_id INTEGER REFERENCES tournament_concepts(id),
  year INTEGER,
  source VARCHAR(50) DEFAULT 'MANUAL',
  needs_review BOOLEAN DEFAULT FALSE,
  api_id VARCHAR(100),
  location_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

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

CREATE TABLE IF NOT EXISTS user_tournaments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) DEFAULT 'paid',
  paid_at TIMESTAMP,
  bracket_submitted BOOLEAN DEFAULT FALSE,
  total_points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bracket_match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
  predicted_winner_id INTEGER REFERENCES players(id) NOT NULL,
  predicted_score VARCHAR(20),
  is_correct BOOLEAN,
  is_score_correct BOOLEAN DEFAULT FALSE,
  is_runner_up_correct BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, bracket_match_id)
);

CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  password_hash VARCHAR(255),
  is_general BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pool_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_tournament ON bracket_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_round ON bracket_matches(tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_bracket_match ON predictions(bracket_match_id);
CREATE INDEX IF NOT EXISTS idx_user_tournaments_user ON user_tournaments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tournaments_tournament ON user_tournaments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_visible ON tournaments(is_visible);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);

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

-- Demo visible tournament so the home page has content
INSERT INTO tournaments (
  name, slug, surface, location, start_date, end_date, status, is_visible,
  category, size, prize_description, image_url
) VALUES (
  'Australian Open 2026',
  'australian-open-2026',
  'Quadra dura',
  'Melbourne, Austrália',
  '2026-01-19 00:00:00',
  '2026-02-01',
  'OPEN',
  TRUE,
  'GRAND_SLAM',
  128,
  'Bolão de demonstração local',
  '/tournaments/australian-open.webp'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO players (name, country, seed, display_name) VALUES
('Jannik Sinner', 'Itália', 1, 'J. Sinner'),
('Carlos Alcaraz', 'Espanha', 2, 'C. Alcaraz'),
('Novak Djokovic', 'Sérvia', 3, 'N. Djokovic'),
('Daniil Medvedev', 'Rússia', 4, 'D. Medvedev'),
('Qualifier', NULL, NULL, 'Qualifier')
ON CONFLICT DO NOTHING;
