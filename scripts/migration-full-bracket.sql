-- Migration to support full bracket predictions and new scoring

-- 1. Update tournaments table to include start time (changing to TIMESTAMP)
ALTER TABLE tournaments ALTER COLUMN start_date TYPE TIMESTAMP;

-- 2. Update user_tournaments to include bracket submission status
ALTER TABLE user_tournaments ADD COLUMN bracket_submitted BOOLEAN DEFAULT FALSE;

-- 3. Update predictions table to include predicted score (for final match)
ALTER TABLE predictions ADD COLUMN predicted_score VARCHAR(20);

-- 4. Drop bonus_predictions table as it's no longer needed
DROP TABLE IF EXISTS bonus_predictions CASCADE;
