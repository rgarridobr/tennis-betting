import { sql } from '../lib/db';

async function main() {
  const users = await sql`SELECT email FROM users LIMIT 1`;
  console.log(users[0]?.email);
}

main().catch(console.error);
