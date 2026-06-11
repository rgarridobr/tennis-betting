import { sql } from './db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  nickname?: string;
  whatsapp?: string;
  tennis_club?: string;
  tennis_club_id?: number | null;
  tennis_club_custom?: string | null;
  state?: string;
  city?: string;
  country?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

sql`CREATE TABLE IF NOT EXISTS tennis_clubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`
  .then(async () => {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tennis_club_id INTEGER REFERENCES tennis_clubs(id)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tennis_club_custom VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`;
  })
  .catch(console.error);

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
    SELECT
      u.id, u.name, u.email, u.nickname, u.whatsapp,
      COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) as tennis_club,
      u.tennis_club_id,
      u.tennis_club_custom,
      u.country as country,
      u.state, u.city, u.is_admin, u.is_active, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN tennis_clubs tc ON tc.id = u.tennis_club_id
    WHERE s.token = ${token}
    AND s.expires_at > NOW()
    AND (u.is_deleted IS FALSE OR u.is_deleted IS NULL)
  `;

  if (sessions.length === 0) return null;

  const user = sessions[0] as User;

  if (!user.is_active) return null;

  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getSession();
  if (!user) redirect('/login');
  return user;
}

export async function requireUserWithLocation(redirectTo?: string): Promise<User> {
  const user = await getSession();
  if (!user) {
    const loginPath = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(loginPath);
  }

  const country = user.country?.trim().toLowerCase() || '';
  const isBrazil = ['brasil', 'brazil'].includes(country);

  if (!user.is_admin) {
    if (!user.tennis_club || !user.country) {
      redirect('/perfil');
    }

    if (isBrazil && (!user.state || !user.city)) {
      redirect('/perfil');
    }
  }

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
  country: string,
  state: string,
  city: string,
  whatsapp?: string,
  tennis_club?: string,
  nickname?: string,
  tennis_club_id?: number | null,
  tennis_club_custom?: string | null,
): Promise<User> {
  const normalizedCountry = country.trim() || 'Brasil';
  const isBrazil = ['brasil', 'brazil'].includes(normalizedCountry.toLowerCase());
  const normalizedState = state.trim();
  const normalizedCity = city.trim();
  const stateValue = isBrazil ? normalizedState : '';
  const cityValue = isBrazil ? normalizedCity : '';

  if (isBrazil && (!normalizedState || !normalizedCity)) {
    throw new Error('State and city are required to register with Brasil');
  }

  const hashedPassword = await hashPassword(password);

  const users = await sql`
    INSERT INTO users (name, email, whatsapp, tennis_club, tennis_club_id, tennis_club_custom, nickname, password_hash, country, state, city)
    VALUES (${name}, ${email}, ${whatsapp}, ${tennis_club}, ${tennis_club_id || null}, ${tennis_club_custom || null}, ${nickname || null}, ${hashedPassword}, ${normalizedCountry}, ${stateValue}, ${cityValue})
    RETURNING id, name, email, nickname, whatsapp, tennis_club, tennis_club_id, tennis_club_custom, country, state, city, is_admin, created_at
  `;

  return users[0] as User;
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const users = await sql`
    SELECT
      u.id, u.name, u.email, u.nickname, u.whatsapp,
      COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) as tennis_club,
      u.tennis_club_id,
      u.tennis_club_custom,
      COALESCE(u.country, 'Brasil') as country,
      u.state, u.city, u.password_hash, u.is_admin, u.is_active, u.created_at
    FROM users u
    LEFT JOIN tennis_clubs tc ON tc.id = u.tennis_club_id
    WHERE u.email = ${email}
    AND (u.is_deleted IS FALSE OR u.is_deleted IS NULL)
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
    tennis_club_id: user.tennis_club_id as number | null,
    tennis_club_custom: user.tennis_club_custom as string | null,
    country: user.country as string,
    state: user.state as string,
    city: user.city as string,
    is_admin: user.is_admin as boolean,
    is_active: user.is_active as boolean,
    created_at: user.created_at as string,
  };
}

// Alias for getSession - used in API routes
export const getCurrentUser = getSession;
