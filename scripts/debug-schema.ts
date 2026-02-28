import { sql } from '../lib/db';

async function main() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'tournaments'
      );
    `;
    console.log('Table tournaments exists:', tableExists[0].exists);

    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tournaments'
    `;
    console.log('Columns in tournaments table:');
    columns.forEach((c: any) => console.log(`- ${c.column_name} (${c.data_type})`));
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

main();
