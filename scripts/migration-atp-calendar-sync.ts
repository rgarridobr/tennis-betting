import { sql } from '../lib/db';

async function migrate() {
  try {
    console.log('Creating tournament_concepts table...');
    await sql`
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
    `;

    console.log('Updating tournaments table...');
    await sql`
      ALTER TABLE tournaments
      ADD COLUMN IF NOT EXISTS tournament_concept_id INTEGER REFERENCES tournament_concepts(id),
      ADD COLUMN IF NOT EXISTS year INTEGER,
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MANUAL',
      ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS api_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS location_text VARCHAR(255);
    `;

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
