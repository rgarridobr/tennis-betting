import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined');
  // In this environment, we might not have it during build/CLI
} else {
  const sql = neon(databaseUrl);

  async function main() {
    try {
      console.log('Adding whatsapp column to users table...');
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);`;
      console.log('Column added successfully!');
    } catch (error) {
      console.error('Error adding column:', error);
      process.exit(1);
    }
  }

  main();
}
