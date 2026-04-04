import { sql } from './db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  nickname?: string;
  whatsapp?: string;
  tennis_club?: string;
  state?: string;
  city?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID();
  // The session will be stored in the database with an expiration date, but
  // the cookie itself is a *session cookie*. Browsers will drop it when the
  // window is closed, which matches the requirement that the session only
  // lasts until the browser is shut down.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // kept for db cleanup

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // no `expires` or `maxAge` makes this a session cookie
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) return null;

  const sessions = await sql`
    SELECT u.id, u.name, u.email, u.nickname, u.whatsapp, u.tennis_club, u.state, u.city, u.is_admin, u.is_active, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token}
    AND s.expires_at > NOW()
    AND (u.is_deleted IS FALSE OR u.is_deleted IS NULL)
  `;

  if (sessions.length === 0) return null;

  const user = sessions[0] as User;

  if (!user.is_active) return null;

  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`;
    cookieStore.delete('session_token');
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  whatsapp?: string,
  tennis_club?: string,
  nickname?: string,
  state?: string,
  city?: string,
): Promise<User> {
  const hashedPassword = await hashPassword(password);

  const users = await sql`
    INSERT INTO users (name, email, whatsapp, tennis_club, nickname, password_hash, state, city)
    VALUES (${name}, ${email}, ${whatsapp}, ${tennis_club}, ${nickname || null}, ${hashedPassword}, ${state || null}, ${city || null})
    RETURNING id, name, email, nickname, whatsapp, tennis_club, state, city, is_admin, created_at
  `;

  return users[0] as User;
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const users = await sql`
    SELECT id, name, email, nickname, whatsapp, tennis_club, state, city, password_hash, is_admin, is_active, created_at
    FROM users WHERE email = ${email}
    AND (is_deleted IS FALSE OR is_deleted IS NULL)
  `;

  if (users.length === 0) return null;

  const user = users[0];
  const isValid = await verifyPassword(password, user.password_hash as string);

  if (!isValid) return null;

  return {
    id: user.id as number,
    name: user.name as string,
    email: user.email as string,
    nickname: user.nickname as string,
    whatsapp: user.whatsapp as string,
    tennis_club: user.tennis_club as string,
    state: user.state as string,
    city: user.city as string,
    is_admin: user.is_admin as boolean,
    is_active: user.is_active as boolean,
    created_at: user.created_at as string,
  };
}

// Alias for getSession - used in API routes
export const getCurrentUser = getSession;
