import { sql } from '../lib/db';

function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}

async function migrate() {
  console.log('Starting Legacy Data Migration...');

  try {
    const legacyTournaments = await sql`SELECT * FROM tournaments WHERE source = 'MANUAL'`;
    const concepts = await sql`SELECT * FROM tournament_concepts`;

    let migratedCount = 0;

    for (const tournament of legacyTournaments) {
      console.log(`Processing legacy: ${tournament.name}`);

      let matchedConceptId: number | null = null;
      let bestMatch = concepts.find(c =>
        normalizeString(c.name) === normalizeString(tournament.name) ||
        tournament.name.toUpperCase().includes(c.code.replace(/_/g, ' '))
      );

      if (bestMatch) {
        matchedConceptId = bestMatch.id;
        console.log(`- Matched with concept: ${bestMatch.name}`);
      }

      await sql`
        UPDATE tournaments SET
          tournament_concept_id = ${matchedConceptId},
          source = 'LEGACY',
          needs_review = ${!matchedConceptId}
        WHERE id = ${tournament.id}
      `;
      migratedCount++;
    }

    console.log(`Legacy migration completed. Processed: ${migratedCount}`);

  } catch (error) {
    console.error('Legacy migration failed:', error);
  }
}

migrate();
