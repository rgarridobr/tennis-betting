import { sql } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  console.log('Running migration: add-bonus-predictions.sql')
  const sqlFile = path.join(process.cwd(), 'scripts', 'add-bonus-predictions.sql')
  const query = fs.readFileSync(sqlFile, 'utf8')

  try {
    // Split queries by semicolon and filter out empty ones
    const queries = query.split(';').map(q => q.trim()).filter(q => q.length > 0)

    for (const q of queries) {
      await sql(q)
      console.log('Executed query successfully')
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
