-- Add tennis_club column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tennis_club VARCHAR(255);
