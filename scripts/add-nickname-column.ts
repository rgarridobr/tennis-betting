import { db } from '../lib/db';

async function main() {
  console.log('Running migration: Add nickname column to users table');
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS nickname TEXT;
    `);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
