import { sql } from './db'
import { ROUND_POINTS } from './data'

// ==================== TOURNAMENT MANAGEMENT ====================

export async function createTournament(data: {
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  type: string
  bracket_size: number
  seeds_count: number
  byes_count: number
  direct_entries_count: number
  qualifiers_count: number
  wildcards_count: number
}): Promise<number> {
  const result = await sql`
    INSERT INTO tournaments (
      name, surface, location, start_date, end_date, status,
      type, bracket_size, seeds_count, byes_count,
      direct_entries_count, qualifiers_count, wildcards_count
    )
    VALUES (
      ${data.name}, ${data.surface}, ${data.location}, ${data.start_date}, ${data.end_date}, 'upcoming',
      ${data.type}, ${data.bracket_size}, ${data.seeds_count}, ${data.byes_count},
      ${data.direct_entries_count}, ${data.qualifiers_count}, ${data.wildcards_count}
    )
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

export async function deletePlayer(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`DELETE FROM players WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    console.error("Error deleting player:", error)
    return {
      success: false,
      error: 'Nao e possivel excluir o jogador pois ele ja possui partidas ou palpites vinculados.'
    }
  }
}

export async function updatePlayer(id: number, name: string, country: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      UPDATE players
      SET name = ${name}, country = ${country}
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error) {
    console.error("Error updating player:", error)
    return { success: false, error: 'Erro ao atualizar jogador. Verifique se o nome já existe.' }
  }
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

// ==================== METADATA MANAGEMENT ====================

export async function createTournamentName(name: string): Promise<number> {
  const result = await sql`INSERT INTO tournament_names (name) VALUES (${name}) RETURNING id`
  return result[0].id as number
}

export async function updateTournamentName(id: number, name: string): Promise<void> {
  await sql`UPDATE tournament_names SET name = ${name} WHERE id = ${id}`
}

export async function deleteTournamentName(id: number): Promise<void> {
  await sql`DELETE FROM tournament_names WHERE id = ${id}`
}

export async function createTournamentLocation(name: string): Promise<number> {
  const result = await sql`INSERT INTO tournament_locations (name) VALUES (${name}) RETURNING id`
  return result[0].id as number
}

export async function updateTournamentLocation(id: number, name: string): Promise<void> {
  await sql`UPDATE tournament_locations SET name = ${name} WHERE id = ${id}`
}

export async function deleteTournamentLocation(id: number): Promise<void> {
  await sql`DELETE FROM tournament_locations WHERE id = ${id}`
}

// ==================== TOURNAMENT ENTRIES ====================

export async function registerPlayerForTournament(data: {
  tournamentId: number
  playerId: number
  entryType: string
  rankingAtCutoff?: number
  pointsAtCutoff?: number
}) {
  await sql`
    INSERT INTO tournament_entries (tournament_id, player_id, entry_type, ranking_at_cutoff, points_at_cutoff)
    VALUES (${data.tournamentId}, ${data.playerId}, ${data.entryType}, ${data.rankingAtCutoff}, ${data.pointsAtCutoff})
    ON CONFLICT (tournament_id, player_id) DO UPDATE SET
      entry_type = EXCLUDED.entry_type,
      ranking_at_cutoff = EXCLUDED.ranking_at_cutoff,
      points_at_cutoff = EXCLUDED.points_at_cutoff
  `
}

export async function removePlayerFromTournament(tournamentId: number, playerId: number) {
  await sql`DELETE FROM tournament_entries WHERE tournament_id = ${tournamentId} AND player_id = ${playerId}`
}

export interface TournamentEntry {
  id: number
  tournament_id: number
  player_id: number
  entry_type: string
  ranking_at_cutoff: number | null
  points_at_cutoff: number | null
  player_name: string
  player_country: string | null
}

export async function getTournamentEntries(tournamentId: number): Promise<TournamentEntry[]> {
  const rows = await sql`
    SELECT te.*, p.name as player_name, p.country as player_country
    FROM tournament_entries te
    JOIN players p ON te.player_id = p.id
    WHERE te.tournament_id = ${tournamentId}
    ORDER BY te.ranking_at_cutoff ASC NULLS LAST
  `
  return rows as unknown as TournamentEntry[]
}

export async function replacePlayerInDraw(tournamentId: number, oldPlayerId: number, newPlayerId: number) {
  // 1. Update the tournament_entries
  // Usually, the old player is removed or marked as withdrawn, and new player is added as LL.
  // For simplicity, we'll swap the player_id in the bracket_matches.

  await sql`
    UPDATE bracket_matches
    SET player1_id = ${newPlayerId}
    WHERE tournament_id = ${tournamentId} AND player1_id = ${oldPlayerId}
  `;

  await sql`
    UPDATE bracket_matches
    SET player2_id = ${newPlayerId}
    WHERE tournament_id = ${tournamentId} AND player2_id = ${oldPlayerId}
  `;

  await sql`
    UPDATE bracket_matches
    SET winner_id = ${newPlayerId}
    WHERE tournament_id = ${tournamentId} AND winner_id = ${oldPlayerId}
  `;

  // 2. Also update tournament_entries to include the new player if not there
  await sql`
    INSERT INTO tournament_entries (tournament_id, player_id, entry_type)
    VALUES (${tournamentId}, ${newPlayerId}, 'ENTRY_LUCKY_LOSER')
    ON CONFLICT (tournament_id, player_id) DO UPDATE SET entry_type = 'ENTRY_LUCKY_LOSER'
  `;
}
