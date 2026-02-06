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
  await sql`UPDATE tournaments SET status = ${status} WHERE id = ${tournamentId}`
}

// ==================== BRACKET GENERATION ====================

export async function generateBracket(tournamentId: number): Promise<void> {
  const existing = await sql`SELECT COUNT(*) as count FROM matches WHERE tournament_id = ${tournamentId}`
  if (Number(existing[0].count) > 0) {
    throw new Error('Chaveamento já foi gerado para este torneio')
  }

  // Generate from Final backwards so we can set next_match_id
  const matchIds: Record<string, number[]> = {}

  // Final (1 match)
  const finalResult = await sql`
    INSERT INTO matches (tournament_id, round, match_number, status)
    VALUES (${tournamentId}, 'Final', 1, 'pending')
    RETURNING id
  `
  matchIds['Final'] = [finalResult[0].id as number]

  // Semifinais (2 matches -> Final)
  const semiIds: number[] = []
  for (let i = 1; i <= 2; i++) {
    const r = await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, 'Semifinais', ${i}, 'pending', ${matchIds['Final'][0]})
      RETURNING id
    `
    semiIds.push(r[0].id as number)
  }
  matchIds['Semifinais'] = semiIds

  // Quartas de Final (4 -> Semis)
  const quartasIds: number[] = []
  for (let i = 1; i <= 4; i++) {
    const nextMatch = matchIds['Semifinais'][Math.floor((i - 1) / 2)]
    const r = await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, 'Quartas de Final', ${i}, 'pending', ${nextMatch})
      RETURNING id
    `
    quartasIds.push(r[0].id as number)
  }
  matchIds['Quartas de Final'] = quartasIds

  // Oitavas de Final (8 -> Quartas)
  const oitavasIds: number[] = []
  for (let i = 1; i <= 8; i++) {
    const nextMatch = matchIds['Quartas de Final'][Math.floor((i - 1) / 2)]
    const r = await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, 'Oitavas de Final', ${i}, 'pending', ${nextMatch})
      RETURNING id
    `
    oitavasIds.push(r[0].id as number)
  }
  matchIds['Oitavas de Final'] = oitavasIds

  // 3ª Rodada (16 -> Oitavas)
  const r3Ids: number[] = []
  for (let i = 1; i <= 16; i++) {
    const nextMatch = matchIds['Oitavas de Final'][Math.floor((i - 1) / 2)]
    const r = await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, '3ª Rodada', ${i}, 'pending', ${nextMatch})
      RETURNING id
    `
    r3Ids.push(r[0].id as number)
  }
  matchIds['3ª Rodada'] = r3Ids

  // 2ª Rodada (32 -> 3ª Rodada)
  const r2Ids: number[] = []
  for (let i = 1; i <= 32; i++) {
    const nextMatch = matchIds['3ª Rodada'][Math.floor((i - 1) / 2)]
    const r = await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, '2ª Rodada', ${i}, 'pending', ${nextMatch})
      RETURNING id
    `
    r2Ids.push(r[0].id as number)
  }
  matchIds['2ª Rodada'] = r2Ids

  // 1ª Rodada (64 -> 2ª Rodada)
  for (let i = 1; i <= 64; i++) {
    const nextMatch = matchIds['2ª Rodada'][Math.floor((i - 1) / 2)]
    await sql`
      INSERT INTO matches (tournament_id, round, match_number, status, next_match_id)
      VALUES (${tournamentId}, '1ª Rodada', ${i}, 'pending', ${nextMatch})
    `
  }
}

// ==================== MATCH MANAGEMENT ====================

export async function updateMatchPlayers(
  matchId: number,
  player1Name: string,
  player2Name: string,
  player1Seed: number | null,
  player2Seed: number | null
): Promise<void> {
  await sql`
    UPDATE matches 
    SET player1_name = ${player1Name}, player2_name = ${player2Name},
        player1_seed = ${player1Seed}, player2_seed = ${player2Seed},
        status = 'scheduled'
    WHERE id = ${matchId}
  `
}

export async function setMatchResult(
  matchId: number,
  winnerName: string,
  score: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const match = await sql`
      SELECT id, round, next_match_id, match_number, player1_name, player2_name 
      FROM matches WHERE id = ${matchId}
    `
    if (match.length === 0) return { success: false, error: 'Partida não encontrada' }

    const m = match[0]
    const round = m.round as string
    const points = ROUND_POINTS[round] || 5

    // Update match
    await sql`
      UPDATE matches 
      SET winner_name = ${winnerName}, score = ${score}, status = 'completed'
      WHERE id = ${matchId}
    `

    // Update predictions
    await sql`
      UPDATE predictions
      SET is_correct = (predicted_winner = ${winnerName}),
          points_earned = CASE WHEN predicted_winner = ${winnerName} THEN ${points} ELSE 0 END
      WHERE match_id = ${matchId}
    `

    // Advance winner to next round
    if (m.next_match_id) {
      const nextMatchId = m.next_match_id as number
      const matchNum = m.match_number as number
      const isPlayer1 = matchNum % 2 === 1

      if (isPlayer1) {
        await sql`UPDATE matches SET player1_name = ${winnerName} WHERE id = ${nextMatchId}`
      } else {
        await sql`UPDATE matches SET player2_name = ${winnerName} WHERE id = ${nextMatchId}`
      }

      // If both players set, mark as scheduled
      const nextMatch = await sql`SELECT player1_name, player2_name FROM matches WHERE id = ${nextMatchId}`
      if (nextMatch[0]?.player1_name && nextMatch[0]?.player2_name) {
        await sql`UPDATE matches SET status = 'scheduled' WHERE id = ${nextMatchId}`
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
    SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC
  `
  return users
}

export async function toggleUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
  await sql`UPDATE users SET is_admin = ${isAdmin} WHERE id = ${userId}`
}

export async function confirmPayment(userId: number, tournamentId: number): Promise<void> {
  await sql`
    UPDATE user_tournaments SET payment_status = 'paid', paid_at = NOW()
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
}
