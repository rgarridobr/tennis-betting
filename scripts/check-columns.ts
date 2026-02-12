import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function checkColumns() {
  const result = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
  `
  console.log(result.map(r => r.column_name))
}

checkColumns()
