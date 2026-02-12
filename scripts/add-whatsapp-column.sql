-- Add whatsapp column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);