import { sql } from '../lib/db';

async function main() {
  try {
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.log('Columns in users table:', columns.map((c: any) => c.column_name));
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

main();
