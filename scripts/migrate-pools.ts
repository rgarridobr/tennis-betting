import { sql } from '../lib/db';

async function migrate() {
  console.log('Starting migration: pools and pool_members');

  try {
    // Create pools table
    await sql`
      CREATE TABLE IF NOT EXISTS pools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        password_hash VARCHAR(255),
        is_general BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table "pools" created or already exists.');

    // Create pool_members table
    await sql`
      CREATE TABLE IF NOT EXISTS pool_members (
        id SERIAL PRIMARY KEY,
        pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pool_id, user_id)
      )
    `;
    console.log('Table "pool_members" created or already exists.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
