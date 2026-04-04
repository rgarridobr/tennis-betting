import { sql } from '../lib/db';

async function main() {
  try {
    console.log('Adding state and city columns to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS state VARCHAR(2),
      ADD COLUMN IF NOT EXISTS city VARCHAR(255)
    `;
    console.log('Success!');
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

main();
