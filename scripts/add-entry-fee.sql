-- Add entry fee to tournaments
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS entry_fee DECIMAL(10, 2) DEFAULT 0;

-- Add payment status to user_tournaments
ALTER TABLE user_tournaments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE user_tournaments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Update existing tournaments with sample entry fees
UPDATE tournaments SET entry_fee = 25.00 WHERE slug = 'roland-garros-2025';
UPDATE tournaments SET entry_fee = 30.00 WHERE slug = 'wimbledon-2025';
UPDATE tournaments SET entry_fee = 20.00 WHERE slug = 'us-open-2025';
