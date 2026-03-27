import { sql } from '../lib/db';

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(5) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table password_resets created successfully');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
    `;
    console.log('Index on password_resets(email) created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

main();
