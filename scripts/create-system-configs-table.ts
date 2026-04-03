import { sql } from '../lib/db'

async function setup() {
  console.log('Setting up system_configs table...')
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_configs (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('system_configs table created or already exists.');
  } catch (err) {
    console.error('Failed to create system_configs table:', err);
    process.exit(1);
  }
}

setup().catch(console.error);
