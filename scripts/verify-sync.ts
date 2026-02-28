import { sql } from '../lib/db';

async function main() {
  try {
    const results = await sql`
      SELECT id, name, category, source, needs_review, tournament_concept_id
      FROM tournaments
      ORDER BY start_date DESC
      LIMIT 10
    `;
    console.table(results);

    const unlinked = await sql`SELECT count(*) FROM tournaments WHERE tournament_concept_id IS NULL`;
    console.log('Unlinked tournaments:', unlinked[0].count);

    const linked = await sql`SELECT count(*) FROM tournaments WHERE tournament_concept_id IS NOT NULL`;
    console.log('Linked tournaments:', linked[0].count);
  } catch (error) {
    console.error('Error verifying sync:', error);
  }
}

main();
