'use server'

import { sql } from '@/lib/db'

export async function getUserCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE is_admin = FALSE 
      AND is_deleted = FALSE
    `
    return Number(result[0].count)
  } catch (error) {
    console.error('Error fetching user count:', error)
    return 0
  }
}
