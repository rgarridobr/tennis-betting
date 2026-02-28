import { sql } from '../lib/db';

async function main() {
  try {
    console.log('Adding slug column to tournaments table...');
    await sql`
      ALTER TABLE tournaments
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
    `;

    // Populate slug for existing tournaments if any
    const tournaments = await sql`SELECT id, name, start_date FROM tournaments WHERE slug IS NULL`;
    for (const t of tournaments) {
      const year = new Date(t.start_date).getFullYear();
      const baseSlug = t.name.toLowerCase().replace(/[^\w]/g, '-');
      const slug = `${baseSlug}-${year}-${t.id}`;
      await sql`UPDATE tournaments SET slug = ${slug} WHERE id = ${t.id}`;
    }

    // Make slug NOT NULL after populating
    await sql`ALTER TABLE tournaments ALTER COLUMN slug SET NOT NULL`;

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
