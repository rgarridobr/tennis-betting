import { sql } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  
  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  
  return token
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (!token) return null
  
  const sessions = await sql`
    SELECT u.id, u.name, u.email, u.is_admin, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token}
    AND s.expires_at > NOW()
  `
  
  if (sessions.length === 0) return null
  
  return sessions[0] as User
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    cookieStore.delete('session_token')
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  
  const users = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${hashedPassword})
    RETURNING id, name, email, is_admin, created_at
  `
  
  return users[0] as User
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const users = await sql`
    SELECT id, name, email, password_hash, is_admin, created_at
    FROM users WHERE email = ${email}
  `
  
  if (users.length === 0) return null
  
  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash as string)
  
  if (!isValid) return null
  
  return {
    id: user.id as number,
    name: user.name as string,
    email: user.email as string,
    is_admin: user.is_admin as boolean,
    created_at: user.created_at as string,
  }
}

// Alias for getSession - used in API routes
export const getCurrentUser = getSession
