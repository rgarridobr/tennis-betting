
import { sql } from '../lib/db'

async function migrate() {
  try {
    console.log('Adding is_active and is_deleted columns to users table...')
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE
    `
    console.log('Migration completed successfully.')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()
