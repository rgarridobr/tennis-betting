import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  try {
    console.log('Adding is_active column to users table...')
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`
    console.log('Success!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()
