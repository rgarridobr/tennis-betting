import { sql } from '../lib/db';

async function main() {
  console.log('Adding is_runner_up_correct column to predictions table...');
  try {
    await sql`ALTER TABLE predictions ADD COLUMN IF NOT EXISTS is_runner_up_correct BOOLEAN DEFAULT FALSE`;
    console.log('Successfully added is_runner_up_correct column.');
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

main();
