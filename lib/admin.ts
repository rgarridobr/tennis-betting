import { sql } from './db'
import type { Tournament, Match } from './data'

export interface UserAdmin {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at: string
  total_predictions: number
  total_points: number
}

export async function getAllUsers(): Promise<UserAdmin[]> {
  const users = await sql`
    SELECT 
      u.id, u.name, u.email, u.is_admin, u.created_at,
      COUNT(p.id) as total_predictions,
      COALESCE(SUM(p.points_earned), 0) as total_points
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `
  return users as UserAdmin[]
}

export async function createTournament(data: {
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  entry_fee: number
  image_url?: string
  status: string
}): Promise<Tournament> {
  const tournaments = await sql`
    INSERT INTO tournaments (name, surface, location, start_date, end_date, entry_fee, image_url, status)
    VALUES (${data.name}, ${data.surface}, ${data.location}, ${data.start_date}, ${data.end_date}, ${data.entry_fee}, ${data.image_url || null}, ${data.status})
    RETURNING *
  `
  return tournaments[0] as Tournament
}

export async function updateTournament(
  id: number,
  data: Partial<{
    name: string
    surface: string
    location: string
    start_date: string
    end_date: string
    image_url: string
    status: string
  }>
): Promise<void> {
  const updates: string[] = []
  const values: unknown[] = []
  
  if (data.name !== undefined) {
    updates.push(`name = $${values.length + 1}`)
    values.push(data.name)
  }
  if (data.surface !== undefined) {
    updates.push(`surface = $${values.length + 1}`)
    values.push(data.surface)
  }
  if (data.location !== undefined) {
    updates.push(`location = $${values.length + 1}`)
    values.push(data.location)
  }
  if (data.start_date !== undefined) {
    updates.push(`start_date = $${values.length + 1}`)
    values.push(data.start_date)
  }
  if (data.end_date !== undefined) {
    updates.push(`end_date = $${values.length + 1}`)
    values.push(data.end_date)
  }
  if (data.image_url !== undefined) {
    updates.push(`image_url = $${values.length + 1}`)
    values.push(data.image_url)
  }
  if (data.status !== undefined) {
    updates.push(`status = $${values.length + 1}`)
    values.push(data.status)
  }
  
  if (updates.length === 0) return
  
  await sql`UPDATE tournaments SET status = ${data.status} WHERE id = ${id}`
}

export async function createMatch(data: {
  tournament_id: number
  player1_name: string
  player2_name: string
  player1_country: string
  player2_country: string
  round: string
  match_date: string
}): Promise<Match> {
  const matches = await sql`
    INSERT INTO matches (tournament_id, player1_name, player2_name, player1_country, player2_country, round, match_date)
    VALUES (${data.tournament_id}, ${data.player1_name}, ${data.player2_name}, ${data.player1_country}, ${data.player2_country}, ${data.round}, ${data.match_date})
    RETURNING *
  `
  return matches[0] as Match
}

export async function updateMatchResult(
  matchId: number,
  winnerNumber: number,
  player1Score: string,
  player2Score: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const match = await sql`SELECT player1_name, player2_name FROM matches WHERE id = ${matchId}`
    if (match.length === 0) {
      return { success: false, error: 'Partida não encontrada' }
    }
    
    const winnerName = winnerNumber === 1 ? match[0].player1_name : match[0].player2_name
    const score = `${player1Score} x ${player2Score}`
    
    // winner column is VARCHAR - save player name, status is 'completed' per schema
    await sql`
      UPDATE matches
      SET winner = ${winnerName}, score = ${score}, status = 'completed'
      WHERE id = ${matchId}
    `
    
    // predicted_winner column is VARCHAR - compare name with name
    await sql`
      UPDATE predictions
      SET is_correct = (predicted_winner = ${winnerName}),
          points_earned = CASE WHEN predicted_winner = ${winnerName} THEN 10 ELSE 0 END
      WHERE match_id = ${matchId}
    `
    
    return { success: true }
  } catch (error) {
    console.error("Error updating match result:", error)
    return { success: false, error: 'Erro ao salvar resultado' }
  }
}

export async function toggleUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
  await sql`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`
}
