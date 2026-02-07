import { sql } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const fileName = 'fix-predictions-schema.sql';
  console.log(`\n🚀 Starting migration: ${fileName}...`);

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
    console.log('\nPlease provide the database connection string:');
    console.log('DATABASE_URL=your_connection_string npx tsx scripts/run-migration.ts');
    process.exit(1);
  }

  try {
    const sqlPath = path.join(process.cwd(), 'scripts', fileName);
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found at ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // The neon client can execute multiple statements in a single call when passed as a string
    // Note: We use type assertion to any because the tagged template function 'sql'
    // also supports being called as a regular function with a string for raw queries.
    await (sql as any)(sqlContent);

    console.log('✅ Migration completed successfully!\n');
  } catch (err: any) {
    console.error('❌ Migration failed:');
    console.error(err.message || err);
    console.log('\nTip: Make sure your DATABASE_URL is correct and you have network access to the database.\n');
    process.exit(1);
  }
}

runMigration();
