import { sql } from './db'
import { ROUND_POINTS, getMatchPoints, POINTS_CONFIG } from './data'

// ==================== TOURNAMENT MANAGEMENT ====================

export async function createTournament(data: {
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  category: string
  category_custom?: string
  format: string
  sets_format: number
  size: number
  has_seeds: boolean
  has_qualifiers: boolean
  has_wildcards: boolean
  has_byes: boolean
  status?: string
  image_url?: string
}): Promise<number> {
  const result = await sql`
    INSERT INTO tournaments (
      name, surface, location, start_date, end_date, status,
      category, category_custom, format, sets_format, size,
      has_seeds, has_qualifiers, has_wildcards, has_byes,
      image_url
    )
    VALUES (
      ${data.name}, ${data.surface}, ${data.location}, ${data.start_date}, ${data.end_date}, ${data.status || 'draft'},
      ${data.category}, ${data.category_custom || null}, ${data.format}, ${data.sets_format}, ${data.size},
      ${data.has_seeds}, ${data.has_qualifiers}, ${data.has_wildcards}, ${data.has_byes},
      ${data.image_url || null}
    )
    RETURNING id
  `
  return result[0].id as number
}

export async function updateTournamentStatus(tournamentId: number, status: string): Promise<void> {
  await sql`UPDATE tournaments SET status = ${status}, updated_at = NOW() WHERE id = ${tournamentId}`
}

export async function deleteTournament(tournamentId: number): Promise<{ success: boolean; error?: string }> {
  const tournament = await sql`SELECT status FROM tournaments WHERE id = ${tournamentId}`
  if (tournament.length === 0) return { success: false, error: 'Torneio não encontrado' }

  const status = tournament[0].status
  if (status !== 'draft' && status !== 'upcoming') {
    return { success: false, error: 'Apenas torneios em rascunho ou em breve podem ser excluídos.' }
  }

  try {
    // Due to foreign keys, we might need to delete in order if not ON DELETE CASCADE
    // In this system, bracket_matches, user_tournaments, etc depend on tournament_id
    await sql`DELETE FROM tournaments WHERE id = ${tournamentId}`
    return { success: true }
  } catch (error) {
    console.error("Error deleting tournament:", error)
    return { success: false, error: 'Erro ao excluir torneio. Verifique se existem dependências.' }
  }
}

export async function prepareTournament(tournamentId: number): Promise<void> {
  const tournament = await sql`SELECT status, size FROM tournaments WHERE id = ${tournamentId}`
  if (tournament.length === 0) throw new Error('Torneio não encontrado')

  if (tournament[0].status !== 'STANDBY' && tournament[0].status !== 'upcoming') {
    throw new Error('Torneio já está preparado ou em outro status')
  }

  // Generate bracket structure
  await generateBracket(tournamentId)

  // Move to UPCOMING (visible to users)
  await sql`UPDATE tournaments SET status = 'UPCOMING', updated_at = NOW() WHERE id = ${tournamentId}`
}

// ==================== BRACKET GENERATION ====================

export async function generateBracket(tournamentId: number): Promise<void> {
  const tournament = await sql`SELECT size FROM tournaments WHERE id = ${tournamentId}`
  if (tournament.length === 0) throw new Error('Torneio não encontrado')

  const size = tournament[0].size as number
  const totalRounds = Math.log2(size)

  const existing = await sql`SELECT COUNT(*) as count FROM bracket_matches WHERE tournament_id = ${tournamentId}`
  if (Number(existing[0].count) > 0) {
    throw new Error('Chaveamento já foi gerado para este torneio')
  }

  for (let round = 1; round <= totalRounds; round++) {
    const matchCount = Math.pow(2, totalRounds - round)
    const values = Array.from({ length: matchCount }, (_, i) => i + 1)
    
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
      error: 'Não é possível excluir o jogador, pois ele já possui partidas ou palpites vinculados.'
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
  player1: { id?: number; type: string; seed?: number | null },
  player2: { id?: number; type: string; seed?: number | null }
): Promise<void> {
  await sql`
    UPDATE bracket_matches 
    SET
      player1_id = ${player1.id || null},
      player1_type = ${player1.type},
      player1_seed = ${player1.seed || null},
      player2_id = ${player2.id || null},
      player2_type = ${player2.type},
      player2_seed = ${player2.seed || null},
      status = 'pending',
      updated_at = NOW()
    WHERE id = ${matchId}
  `
}

export function calculateSetScore(score: string): string {
  if (!score || score.toUpperCase() === 'W/O' || score.toUpperCase() === 'BYE') return '';
  const sets = score.trim().split(/\s+/);
  let p1 = 0;
  let p2 = 0;
  for (const set of sets) {
    const games = set.split('-').map(Number);
    if (games.length === 2 && !isNaN(games[0]) && !isNaN(games[1])) {
      if (games[0] > games[1]) p1++;
      else if (games[1] > games[0]) p2++;
    }
  }
  // Standardize to Winner-Loser format for comparison
  return p1 >= p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
}

export function validateTennisScore(score: string, setsToWin: number): { valid: boolean; winner?: 1 | 2; error?: string } {
  if (score.toUpperCase() === 'W/O' || score.toUpperCase() === 'WALKOVER') {
    return { valid: true }
  }

  const sets = score.trim().split(/\s+/)
  let player1Sets = 0
  let player2Sets = 0

  for (const set of sets) {
    const games = set.split('-').map(Number)
    if (games.length !== 2 || isNaN(games[0]) || isNaN(games[1])) {
      return { valid: false, error: `Placar de set inválido: ${set}` }
    }
    const [g1, g2] = games
    if (g1 < 0 || g2 < 0) return { valid: false, error: 'Games não podem ser negativos' }

    const isSetFinished = (g1 >= 6 || g2 >= 6) && Math.abs(g1 - g2) >= 2 || (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7)

    if (!isSetFinished) return { valid: false, error: `Set incompleto ou inválido: ${set}` }
    if (g1 > 7 || g2 > 7) return { valid: false, error: `Placar impossível: ${set}` }
    if ((g1 === 7 && g2 < 5) || (g2 === 7 && g1 < 5)) return { valid: false, error: `Placar inválido: ${set}` }

    if (g1 > g2) player1Sets++
    else player2Sets++

    if (player1Sets === setsToWin || player2Sets === setsToWin) {
      if (sets.indexOf(set) !== sets.length - 1) {
        return { valid: false, error: 'Sets extras após o vencedor ser definido' }
      }
      return { valid: true, winner: player1Sets === setsToWin ? 1 : 2 }
    }
  }

  return { valid: false, error: `Partida incompleta. São necessários ${setsToWin} sets para vencer.` }
}

export async function setMatchResult(
  matchId: number,
  winnerId: number,
  score: string,
  options?: { isWalkover?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const matchData = await sql`
      SELECT bm.*, t.sets_format, t.size, t.status as tournament_status
      FROM bracket_matches bm
      JOIN tournaments t ON bm.tournament_id = t.id
      WHERE bm.id = ${matchId}
    `
    if (matchData.length === 0) return { success: false, error: 'Partida não encontrada' }

    const m = matchData[0]
    const round = m.round as number
    const position = m.position as number
    const tournamentId = m.tournament_id as number
    const category = m.category || 'GRAND_SLAM'
    const setsToWin = m.sets_format === 5 ? 3 : 2
    const totalRounds = Math.log2(m.size as number)

    if (m.tournament_status === 'finished' || m.tournament_status === 'completed') {
      return { success: false, error: 'O torneio já foi finalizado e os resultados não podem ser alterados.' }
    }

    if (m.tournament_status === 'draft' || m.tournament_status === 'upcoming' || m.tournament_status === 'STANDBY' || m.tournament_status === 'UPCOMING') {
      return { success: false, error: 'O torneio ainda não foi publicado. Publique-o antes de lançar resultados.' }
    }


    if (!options?.isWalkover) {
      const validation = validateTennisScore(score, setsToWin)
      if (!validation.valid) return { success: false, error: validation.error }

      // If validation returned a winner based on score, ensure it matches winnerId
      if (validation.winner) {
        const expectedWinnerId = validation.winner === 1 ? m.player1_id : m.player2_id
        if (winnerId !== expectedWinnerId) {
          return { success: false, error: 'O vencedor selecionado não coincide com o placar dos sets' }
        }
      }
    }

    const points = getMatchPoints(category, round, totalRounds);

    // Update match result
    await sql`
      UPDATE bracket_matches 
      SET winner_id = ${winnerId}, score = ${score}, status = 'completed', updated_at = NOW()
      WHERE id = ${matchId}
    `

    if (round < totalRounds) {
      // Regular rounds: Update predictions
      await sql`
        UPDATE predictions
        SET is_correct = (predicted_winner_id = ${winnerId}),
            points_earned = CASE WHEN predicted_winner_id = ${winnerId} THEN ${points} ELSE 0 END,
            is_score_correct = FALSE
        WHERE bracket_match_id = ${matchId}
      `
      // Advance winner to next round
      await advancePlayer(tournamentId, round, position, winnerId)
    } else {
      // Final round completed
      const runnerUpId = m.player1_id === winnerId ? m.player2_id : m.player1_id
      await sql`
        UPDATE tournaments
        SET status = 'finished', champion_id = ${winnerId}, runner_up_id = ${runnerUpId}, updated_at = NOW()
        WHERE id = ${tournamentId}
      `

      // Special scoring for final
      const catConfig = POINTS_CONFIG[category] || POINTS_CONFIG.GRAND_SLAM;
      const championPoints = catConfig.rounds[catConfig.rounds.length - 1];
      const runnerUpPoints = catConfig.runnerUp;
      const actualSetScore = calculateSetScore(score);

      // To calculate runner-up points, we need to know who each user predicted would reach the final
      // The predicted runner-up is the winner of the OTHER semifinal in their bracket.

      const semiMatches = await sql`
        SELECT id, round, position FROM bracket_matches
        WHERE tournament_id = ${tournamentId} AND round = ${totalRounds - 1}
      `

      const userPredictions = await sql`
        SELECT p.user_id, p.bracket_match_id, p.predicted_winner_id, p.predicted_score
        FROM predictions p
        JOIN bracket_matches bm ON p.bracket_match_id = bm.id
        WHERE bm.tournament_id = ${tournamentId} AND bm.round IN (${totalRounds}, ${totalRounds - 1})
      `

      // Group by user
      const byUser: Record<number, any> = {}
      for (const p of userPredictions) {
        if (!byUser[p.user_id]) byUser[p.user_id] = {}
        byUser[p.user_id][p.bracket_match_id] = {
          winner_id: p.predicted_winner_id,
          score: p.predicted_score
        }
      }

      for (const userId of Object.keys(byUser)) {
        const uId = parseInt(userId)
        const preds = byUser[uId]
        const finalPred = preds[matchId]

        // Find the two semi match IDs
        const semi1Id = semiMatches.find(s => s.position === 1)?.id
        const semi2Id = semiMatches.find(s => s.position === 2)?.id

        const semi1Winner = preds[semi1Id!]?.winner_id
        const semi2Winner = preds[semi2Id!]?.winner_id

        const predictedChampion = finalPred?.winner_id
        const predictedRunnerUp = predictedChampion === semi1Winner ? semi2Winner : semi1Winner

        let finalPoints = 0
        let isScoreCorrect = false

        if (predictedChampion === winnerId) {
          finalPoints += championPoints
          // Check score tie-breaker
          if (finalPred?.score) {
            const predSetScore = calculateSetScore(finalPred.score)
            if (predSetScore === actualSetScore) {
              isScoreCorrect = true
            }
          }
        }

        if (predictedRunnerUp === runnerUpId) {
          finalPoints += runnerUpPoints
        }

        await sql`
          UPDATE predictions
          SET is_correct = (predicted_winner_id = ${winnerId}),
              points_earned = ${finalPoints},
              is_score_correct = ${isScoreCorrect}
          WHERE bracket_match_id = ${matchId} AND user_id = ${uId}
        `
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error setting match result:", error)
    return { success: false, error: 'Erro ao salvar resultado' }
  }
}

async function advancePlayer(tournamentId: number, currentRound: number, currentPosition: number, winnerId: number | null) {
  const nextRound = currentRound + 1
  const nextPosition = Math.ceil(currentPosition / 2)
  const isPlayer1Slot = currentPosition % 2 === 1

  // Get current match data to preserve winner's identity (type/seed)
  const currentMatch = await sql`
    SELECT player1_id, player1_type, player1_seed, player2_id, player2_type, player2_seed
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = ${currentRound} AND position = ${currentPosition}
  `

  let winnerType = 'PLAYER'
  let winnerSeed = null

  if (winnerId && currentMatch.length > 0) {
    const cm = currentMatch[0]
    if (cm.player1_id === winnerId) {
      winnerType = cm.player1_type
      winnerSeed = cm.player1_seed
    } else if (cm.player2_id === winnerId) {
      winnerType = cm.player2_type
      winnerSeed = cm.player2_seed
    }
  }

  const nextMatch = await sql`
    SELECT bm.id, bm.player1_id, bm.player2_id, bm.player1_type, bm.player2_type, bm.status, t.size
    FROM bracket_matches bm
    JOIN tournaments t ON bm.tournament_id = t.id
    WHERE bm.tournament_id = ${tournamentId} AND bm.round = ${nextRound} AND bm.position = ${nextPosition}
  `

  if (nextMatch.length > 0) {
    const nm = nextMatch[0]
    const nextMatchId = nm.id

    // If we are advancing a winner, but the match was already completed, we need to reset it
    // especially if the participant is changing.
    const playerChanged = isPlayer1Slot ? (nm.player1_id !== winnerId) : (nm.player2_id !== winnerId)

    if (isPlayer1Slot) {
      await sql`UPDATE bracket_matches SET player1_id = ${winnerId}, player1_type = ${winnerType}, player1_seed = ${winnerSeed}, updated_at = NOW() WHERE id = ${nextMatchId}`
    } else {
      await sql`UPDATE bracket_matches SET player2_id = ${winnerId}, player2_type = ${winnerType}, player2_seed = ${winnerSeed}, updated_at = NOW() WHERE id = ${nextMatchId}`
    }

    if (nm.status === 'completed' && playerChanged) {
      // Reset this match because one of the participants changed
      await sql`UPDATE bracket_matches SET status = 'pending', winner_id = NULL, score = NULL, updated_at = NOW() WHERE id = ${nextMatchId}`
      await sql`UPDATE predictions SET is_correct = NULL, points_earned = 0 WHERE bracket_match_id = ${nextMatchId}`

      // Cascade reset to next rounds
      const totalRounds = Math.log2(nm.size)
      if (nextRound < totalRounds) {
        await advancePlayer(tournamentId, nextRound, nextPosition, null)
      }
    }

    // Only proceed with auto-advancement if we have a winnerId
    if (winnerId) {
      const updatedMatch = await sql`SELECT * FROM bracket_matches WHERE id = ${nextMatchId}`
      const um = updatedMatch[0]

      if (um.player1_id && um.player2_type === 'BYE') {
        await setMatchResult(nextMatchId, um.player1_id, 'BYE', { isWalkover: true })
      } else if (um.player2_id && um.player1_type === 'BYE') {
        await setMatchResult(nextMatchId, um.player2_id, 'BYE', { isWalkover: true })
      } else if (um.player1_id && um.player2_id && um.status !== 'completed') {
        await sql`UPDATE bracket_matches SET status = 'scheduled' WHERE id = ${nextMatchId}`
      }
    }
  }
}

export async function publishTournament(tournamentId: number): Promise<void> {
  const tournament = await sql`SELECT size FROM tournaments WHERE id = ${tournamentId}`
  if (tournament.length === 0) throw new Error('Torneio não encontrado')

  // 1. Mark tournament as active
  await sql`UPDATE tournaments SET status = 'OPEN', updated_at = NOW() WHERE id = ${tournamentId}`

  // 2. Resolve BYEs in the first round
  const firstRoundMatches = await sql`
    SELECT * FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = 1
  `

  for (const match of firstRoundMatches) {
    if (match.player1_type === 'BYE' && match.player2_id) {
      await setMatchResult(match.id, match.player2_id, 'BYE', { isWalkover: true })
    } else if (match.player2_type === 'BYE' && match.player1_id) {
      await setMatchResult(match.id, match.player1_id, 'BYE', { isWalkover: true })
    } else if (match.player1_id && match.player2_id) {
      await sql`UPDATE bracket_matches SET status = 'scheduled' WHERE id = ${match.id}`
    }
  }
}

export async function updatePlaceholderPlayer(
  matchId: number,
  slot: 1 | 2,
  playerId: number
): Promise<void> {
  if (slot === 1) {
    await sql`UPDATE bracket_matches SET player1_id = ${playerId}, updated_at = NOW() WHERE id = ${matchId}`
  } else {
    await sql`UPDATE bracket_matches SET player2_id = ${playerId}, updated_at = NOW() WHERE id = ${matchId}`
  }

  // If both players are now set and it's not completed, mark as scheduled
  const match = await sql`SELECT * FROM bracket_matches WHERE id = ${matchId}`
  const m = match[0]
  if (m.player1_id && m.player2_id && m.status !== 'completed') {
    await sql`UPDATE bracket_matches SET status = 'scheduled' WHERE id = ${matchId}`
  }
}

// ==================== USER MANAGEMENT ====================

export async function getAllUsers() {
  const users = await sql`
    SELECT u.id, u.name, u.email, u.nickname, u.whatsapp, u.tennis_club, u.is_admin, u.is_active, u.is_deleted, u.created_at,
      COUNT(p.id) as total_predictions
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    WHERE u.is_deleted = FALSE
    GROUP BY u.id, u.name, u.email, u.nickname, u.whatsapp, u.tennis_club, u.is_admin, u.is_active, u.is_deleted, u.created_at
    ORDER BY u.created_at DESC
  `
  return users
}

export async function updateUser(id: number, data: { name: string, email: string, nickname?: string, whatsapp: string, tennis_club: string }): Promise<void> {
  await sql`
    UPDATE users
    SET name = ${data.name}, email = ${data.email}, nickname = ${data.nickname || null}, whatsapp = ${data.whatsapp}, tennis_club = ${data.tennis_club}, updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function toggleUserStatus(id: number, isActive: boolean): Promise<void> {
  await sql`UPDATE users SET is_active = ${isActive}, updated_at = NOW() WHERE id = ${id}`
}

export async function softDeleteUser(id: number): Promise<void> {
  await sql`UPDATE users SET is_deleted = TRUE, is_active = FALSE WHERE id = ${id}`
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

export async function isRound1Complete(tournamentId: number): Promise<boolean> {
  const matches = await sql`
    SELECT player1_id, player1_type, player2_id, player2_type
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = 1
  `

  if (matches.length === 0) return false

  return matches.every(m => {
    // Both types must be defined
    if (!m.player1_type || !m.player2_type) return false

    // If type is PLAYER or SEED, id must be defined
    if ((m.player1_type === 'PLAYER' || m.player1_type === 'SEED') && !m.player1_id) return false
    if ((m.player2_type === 'PLAYER' || m.player2_type === 'SEED') && !m.player2_id) return false

    return true
  })
}

