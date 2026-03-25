import { sql } from '../lib/db';

async function migrate() {
  console.log('Adding is_visible column to tournaments table...');
  try {
    await sql`ALTER TABLE tournaments ADD COLUMN is_visible BOOLEAN DEFAULT TRUE`;
    console.log('Column added successfully.');

    console.log('Setting is_visible = FALSE for STANDBY tournaments...');
    const result = await sql`UPDATE tournaments SET is_visible = FALSE WHERE status = 'STANDBY' OR status = 'draft'`;
    console.log(`Updated ${result.length} tournaments.`);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('Column already exists, skipping migration.');
    } else {
      throw error;
    }
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
