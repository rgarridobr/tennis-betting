import { sql } from './db'
import { ROUND_POINTS } from './data'

// ==================== TOURNAMENT MANAGEMENT ====================

export async function createTournament(data: {
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
}): Promise<number> {
  const result = await sql`
    INSERT INTO tournaments (name, surface, location, start_date, end_date, status)
    VALUES (${data.name}, ${data.surface}, ${data.location}, ${data.start_date}, ${data.end_date}, 'upcoming')
    RETURNING id
  `
  return result[0].id as number
}

export async function updateTournamentStatus(tournamentId: number, status: string): Promise<void> {
  await sql`UPDATE tournaments SET status = ${status}, updated_at = NOW() WHERE id = ${tournamentId}`
}

// ==================== BRACKET GENERATION ====================

export async function generateBracket(tournamentId: number): Promise<void> {
  const existing = await sql`SELECT COUNT(*) as count FROM bracket_matches WHERE tournament_id = ${tournamentId}`
  if (Number(existing[0].count) > 0) {
    throw new Error('Chaveamento ja foi gerado para este torneio')
  }

  // Total: 64 + 32 + 16 + 8 + 4 + 2 + 1 = 127 matches
  // Build all values and insert per round to avoid timeout
  for (let round = 1; round <= 7; round++) {
    const matchCount = Math.pow(2, 7 - round) // 64, 32, 16, 8, 4, 2, 1
    const values = Array.from({ length: matchCount }, (_, i) => i + 1)
    
    // Insert all matches for this round in parallel
    await Promise.all(
      values.map(pos => 
        sql`INSERT INTO bracket_matches (tournament_id, round, position, status) VALUES (${tournamentId}, ${round}, ${pos}, 'pending')`
      )
    )
  }
}

// ==================== PLAYER MANAGEMENT ====================

export async function createPlayer(name: string, country: string | null, seed: number | null): Promise<number> {
  const result = await sql`
    INSERT INTO players (name, country, seed)
    VALUES (${name}, ${country}, ${seed})
    ON CONFLICT (name) DO UPDATE SET country = COALESCE(${country}, players.country), seed = COALESCE(${seed}, players.seed)
    RETURNING id
  `
  return result[0].id as number
}

export async function importPlayers(players: Array<{ name: string; country: string | null; seed: number | null }>): Promise<number> {
  let count = 0
  for (const p of players) {
    await sql`
      INSERT INTO players (name, country, seed)
      VALUES (${p.name}, ${p.country}, ${p.seed})
      ON CONFLICT (name) DO UPDATE SET country = COALESCE(${p.country}, players.country), seed = COALESCE(${p.seed}, players.seed)
    `
    count++
  }
  return count
}

// ==================== MATCH MANAGEMENT ====================

export async function setMatchPlayers(
  matchId: number,
  player1Id: number,
  player2Id: number
): Promise<void> {
  await sql`
    UPDATE bracket_matches 
    SET player1_id = ${player1Id}, player2_id = ${player2Id}, status = 'scheduled', updated_at = NOW()
    WHERE id = ${matchId}
  `
}

export async function setMatchResult(
  matchId: number,
  winnerId: number,
  score: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const match = await sql`
      SELECT id, tournament_id, round, position, player1_id, player2_id
      FROM bracket_matches WHERE id = ${matchId}
    `
    if (match.length === 0) return { success: false, error: 'Partida nao encontrada' }

    const m = match[0]
    const round = m.round as number
    const position = m.position as number
    const tournamentId = m.tournament_id as number
    const points = ROUND_POINTS[round] || 5

    // Update match result
    await sql`
      UPDATE bracket_matches 
      SET winner_id = ${winnerId}, score = ${score}, status = 'completed', updated_at = NOW()
      WHERE id = ${matchId}
    `

    // Update predictions
    await sql`
      UPDATE predictions
      SET is_correct = (predicted_winner_id = ${winnerId}),
          points_earned = CASE WHEN predicted_winner_id = ${winnerId} THEN ${points} ELSE 0 END
      WHERE bracket_match_id = ${matchId}
    `

    // Advance winner to next round (if not Final)
    if (round < 7) {
      const nextRound = round + 1
      const nextPosition = Math.ceil(position / 2)
      const isPlayer1Slot = position % 2 === 1

      // Find the next round match
      const nextMatch = await sql`
        SELECT id, player1_id, player2_id FROM bracket_matches
        WHERE tournament_id = ${tournamentId} AND round = ${nextRound} AND position = ${nextPosition}
      `

      if (nextMatch.length > 0) {
        const nextMatchId = nextMatch[0].id

        if (isPlayer1Slot) {
          await sql`UPDATE bracket_matches SET player1_id = ${winnerId}, updated_at = NOW() WHERE id = ${nextMatchId}`
        } else {
          await sql`UPDATE bracket_matches SET player2_id = ${winnerId}, updated_at = NOW() WHERE id = ${nextMatchId}`
        }

        // If both players are now set, mark as scheduled
        const updated = await sql`SELECT player1_id, player2_id FROM bracket_matches WHERE id = ${nextMatchId}`
        if (updated[0]?.player1_id && updated[0]?.player2_id) {
          await sql`UPDATE bracket_matches SET status = 'scheduled', updated_at = NOW() WHERE id = ${nextMatchId}`
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error setting match result:", error)
    return { success: false, error: 'Erro ao salvar resultado' }
  }
}

// ==================== USER MANAGEMENT ====================

export async function getAllUsers() {
  const users = await sql`
    SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
      COUNT(p.id) as total_predictions
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    GROUP BY u.id, u.name, u.email, u.is_admin, u.created_at
    ORDER BY u.created_at DESC
  `
  return users
}

export async function toggleUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
  await sql`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`
}
