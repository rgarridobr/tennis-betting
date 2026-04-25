import { sql } from '../lib/db';
import { hashPassword } from '../lib/auth';

async function createTestUser() {
  const hashedPassword = await hashPassword('password123');
  const userResult = await sql`
    INSERT INTO users (name, email, password_hash, nickname, state, city, tennis_club, is_active)
    VALUES ('Test User', 'jules_test@example.com', ${hashedPassword}, 'JulesTest', 'RJ', 'Rio de Janeiro', 'Test Club', true)
    ON CONFLICT (email) DO UPDATE SET is_active = true
    RETURNING id
  `;
  const userId = userResult[0].id;

  const token = 'test-session-token-jules';
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  console.log('Test user and session created');
}

createTestUser().catch(console.error);
