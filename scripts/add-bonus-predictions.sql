-- Add bonus predictions table
CREATE TABLE IF NOT EXISTS bonus_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  champion_id INTEGER REFERENCES players(id),
  runner_up_id INTEGER REFERENCES players(id),
  semi1_id INTEGER REFERENCES players(id),
  semi2_id INTEGER REFERENCES players(id),
  semi3_id INTEGER REFERENCES players(id),
  semi4_id INTEGER REFERENCES players(id),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tournament_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bonus_predictions_tournament ON bonus_predictions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_bonus_predictions_user ON bonus_predictions(user_id);
