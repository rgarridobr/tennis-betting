import { sql } from './db';
import { ROUND_POINTS, getMatchPoints, getPointsConfig } from './data';
import { getTranslations } from 'next-intl/server';
import { sortByPtBrText } from './sorting';

function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');
}

// ==================== TOURNAMENT MANAGEMENT ====================

export async function createTournament(data: {
  name: string;
  surface: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
  category_custom?: string;
  format: string;
  sets_format: number;
  size: number;
  has_seeds: boolean;
  has_qualifiers: boolean;
  has_wildcards: boolean;
  has_byes: boolean;
  status?: string;
  image_url?: string;
  prize_description?: string | null;
}): Promise<number> {
  const t = await getTranslations('errors');
  const start = new Date(data.start_date);
  const year = start.getFullYear();

  // Find matching concept
  const concepts = await sql`SELECT * FROM tournament_concepts`;

  const bestMatch = concepts.find(
    (c: any) =>
      normalizeString(c.name) === normalizeString(data.name) ||
      data.name.toUpperCase().includes(c.code.replace(/_/g, ' ')),
  );

  const code = bestMatch ? bestMatch.code : normalizeString(data.name);
  const slug = `${code}-${year}`;
  const conceptId = bestMatch ? bestMatch.id : null;

  // Check for duplicate slug
  const existing = await sql`SELECT id FROM tournaments WHERE slug = ${slug}`;
  if (existing.length > 0) {
    throw new Error(t('adminTournamentNameExists', { year, slug }));
  }

  const result = await sql`
    INSERT INTO tournaments (
      name, slug, surface, location, start_date, end_date, status,
      category, category_custom, format, sets_format, size,
      has_seeds, has_qualifiers, has_wildcards, has_byes,
      image_url, prize_description, source, year, tournament_concept_id, needs_review
    )
    VALUES (
      ${data.name}, ${slug}, ${data.surface}, ${data.location}, ${data.start_date}, ${data.end_date}, ${data.status || 'draft'},
      ${data.category}, ${data.category_custom || null}, ${data.format}, ${data.sets_format}, ${data.size},
      ${data.has_seeds}, ${data.has_qualifiers}, ${data.has_wildcards}, ${data.has_byes},
      ${data.image_url || null}, ${data.prize_description || null}, 'MANUAL', ${year}, ${conceptId}, ${!conceptId}
    )
    RETURNING id
  `;
  return result[0].id as number;
}

export async function updateTournamentStatus(tournamentId: number, status: string): Promise<void> {
  await sql`UPDATE tournaments SET status = ${status}, updated_at = NOW() WHERE id = ${tournamentId}`;
}

export async function finishTournament(tournamentId: number): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  try {
    const finalMatches = await sql`
      SELECT bm.player1_id, bm.player2_id, bm.winner_id, bm.status
      FROM bracket_matches bm
      WHERE bm.tournament_id = ${tournamentId}
      AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
      LIMIT 1
    `;

    if (finalMatches.length === 0) {
      return { success: false, error: t('adminFinalNotFound') };
    }

    const final = finalMatches[0];
    if (final.status !== 'completed' || !final.winner_id) {
      return { success: false, error: t('adminFinalResultRequired') };
    }

    const runnerUpId = final.player1_id === final.winner_id ? final.player2_id : final.player1_id;
    if (!runnerUpId) {
      return { success: false, error: t('adminRunnerUpUnknown') };
    }

    await sql`
      UPDATE tournaments
      SET status = 'FINISHED', champion_id = ${final.winner_id}, runner_up_id = ${runnerUpId}, updated_at = NOW()
      WHERE id = ${tournamentId}
    `;

    return { success: true };
  } catch (error) {
    console.error('Error finishing tournament:', error);
    return { success: false, error: t('adminFinishFailed') };
  }
}

export async function updateTournament(
  tournamentId: number,
  data: Partial<{
    name: string;
    surface: string;
    location: string;
    start_date: string;
    end_date: string;
    category: string;
    category_custom?: string;
    format: string;
    sets_format: number;
    size: number;
    has_seeds: boolean;
    has_qualifiers: boolean;
    has_wildcards: boolean;
    has_byes: boolean;
    image_url?: string;
    prize_description?: string | null;
    status?: string;
  }>,
): Promise<void> {
  // If updating start_date, check if we need to revert status to OPEN
  if (data.start_date) {
    const result = await sql`
      SELECT status,
             (${data.start_date}::timestamp > (NOW() - INTERVAL '3 hours')) as is_future
      FROM tournaments
      WHERE id = ${tournamentId}
    `;
    if (result.length > 0) {
      const currentStatus = result[0].status;
      const isFuture = result[0].is_future;

      if (currentStatus === 'IN_PROGRESS' && isFuture) {
        data.status = 'OPEN';
      }
    }
  }

  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) return;

  const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');

  const values = entries.map(([_, value]) => value);

  await sql.query(
    `UPDATE tournaments 
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${entries.length + 1}`,
    [...values, tournamentId],
  );
}

export async function deleteTournament(tournamentId: number): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT status FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) return { success: false, error: t('adminTournamentNotFound') };

  const status = tournament[0].status;
  if (status !== 'draft' && status !== 'upcoming') {
    return { success: false, error: t('adminDeleteStatusBlocked') };
  }

  try {
    // Due to foreign keys, we might need to delete in order if not ON DELETE CASCADE
    // In this system, bracket_matches, user_tournaments, etc depend on tournament_id
    await sql`DELETE FROM tournaments WHERE id = ${tournamentId}`;
    return { success: true };
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return { success: false, error: t('adminDeleteTournamentFailed') };
  }
}

export async function prepareTournament(tournamentId: number): Promise<void> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT status, size FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) throw new Error(t('adminTournamentNotFound'));

  if (tournament[0].status !== 'STANDBY' && tournament[0].status !== 'upcoming') {
    throw new Error(t('adminAlreadyPrepared'));
  }

  // Generate bracket structure
  await generateBracket(tournamentId);

  // Move to UPCOMING (visible to users)
  await sql`UPDATE tournaments SET status = 'UPCOMING', updated_at = NOW() WHERE id = ${tournamentId}`;
}

export async function resetTournamentToStandby(tournamentId: number): Promise<void> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT status FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) throw new Error(t('adminTournamentNotFound'));

  // We should only allow reset if it's in UPCOMING or STANDBY (though STANDBY shouldn't have matches yet usually, unless it was just prepared)
  // Actually, the user wants to go back from UPCOMING to STANDBY.

  // 1. Delete predictions
  await sql`
    DELETE FROM predictions
    WHERE bracket_match_id IN (
      SELECT id FROM bracket_matches WHERE tournament_id = ${tournamentId}
    )
  `;

  // 2. Delete matches
  await sql`DELETE FROM bracket_matches WHERE tournament_id = ${tournamentId}`;

  // 3. Reset status and other fields if necessary
  await sql`
    UPDATE tournaments
    SET status = 'STANDBY', champion_id = NULL, runner_up_id = NULL, updated_at = NOW()
    WHERE id = ${tournamentId}
  `;
}

export async function randomizeFirstRound(tournamentId: number): Promise<void> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT status, size FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) throw new Error(t('adminTournamentNotFound'));

  const matches = await sql`
    SELECT id FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = 1
    ORDER BY position ASC
  `;

  if (matches.length === 0) throw new Error(t('adminBracketMissing'));

  const players = await sql`SELECT id FROM players`;
  if (players.length === 0) throw new Error(t('adminNoPlayersRegistered'));

  // Shuffle players
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  let playerIdx = 0;
  for (const match of matches) {
    const p1 = shuffledPlayers[playerIdx % shuffledPlayers.length];
    playerIdx++;
    const p2 = shuffledPlayers[playerIdx % shuffledPlayers.length];
    playerIdx++;

    await sql`
      UPDATE bracket_matches
      SET
        player1_id = ${p1.id}, player1_type = 'PLAYER', player1_seed = NULL,
        player2_id = ${p2.id}, player2_type = 'PLAYER', player2_seed = NULL,
        status = 'pending'
      WHERE id = ${match.id}
    `;
  }
}

// ==================== BRACKET GENERATION ====================

export async function generateBracket(tournamentId: number): Promise<void> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT size FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) throw new Error(t('adminTournamentNotFound'));

  const size = tournament[0].size as number;
  const totalRounds = Math.ceil(Math.log2(size));

  const existing = await sql`SELECT COUNT(*) as count FROM bracket_matches WHERE tournament_id = ${tournamentId}`;
  if (Number(existing[0].count) > 0) {
    throw new Error(t('adminBracketAlreadyGenerated'));
  }

  const allMatches = [];
  for (let round = 1; round <= totalRounds; round++) {
    const matchCount = Math.pow(2, totalRounds - round);
    for (let pos = 1; pos <= matchCount; pos++) {
      allMatches.push({ round, pos });
    }
  }

  // Bulk insert for better performance
  for (const match of allMatches) {
    await sql`
      INSERT INTO bracket_matches (tournament_id, round, position, status)
      VALUES (${tournamentId}, ${match.round}, ${match.pos}, 'pending')
      ON CONFLICT (tournament_id, round, position) DO NOTHING
    `;
  }
}

// ==================== PLAYER MANAGEMENT ====================

export async function createPlayer(
  name: string,
  country: string | null,
  seed: number | null,
  display_name: string | null = null,
): Promise<number> {
  const result = await sql`
    INSERT INTO players (name, country, seed, display_name)
    VALUES (${name}, ${country}, ${seed}, ${display_name})
    ON CONFLICT (name) DO UPDATE SET 
      country = COALESCE(${country}, players.country), 
      seed = COALESCE(${seed}, players.seed),
      display_name = COALESCE(${display_name}, players.display_name)
    RETURNING id
  `;
  return result[0].id as number;
}

export async function deletePlayer(id: number): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  try {
    await sql`DELETE FROM players WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('Error deleting player:', error);
    return {
      success: false,
      error: t('adminPlayerDeleteBlocked'),
    };
  }
}

export async function updatePlayer(
  id: number,
  name: string,
  country: string | null,
  display_name: string | null,
): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  try {
    await sql`
      UPDATE players
      SET name = ${name}, country = ${country}, display_name = ${display_name}
      WHERE id = ${id}
    `;
    return { success: true };
  } catch (error) {
    console.error('Error updating player:', error);
    return { success: false, error: t('adminPlayerUpdateFailed') };
  }
}

export async function importPlayers(
  players: Array<{ name: string; country: string | null; seed: number | null; display_name: string | null }>,
): Promise<number> {
  let count = 0;
  for (const p of players) {
    await sql`
      INSERT INTO players (name, country, seed, display_name)
      VALUES (${p.name}, ${p.country}, ${p.seed}, ${p.display_name})
      ON CONFLICT (name) DO UPDATE SET 
        country = COALESCE(${p.country}, players.country), 
        seed = COALESCE(${p.seed}, players.seed),
        display_name = COALESCE(${p.display_name}, players.display_name)
    `;
    count++;
  }
  return count;
}

// ==================== MATCH MANAGEMENT ====================

export async function setMatchPlayers(
  matchId: number,
  player1: { id?: number; type: string; seed?: number | null },
  player2: { id?: number; type: string; seed?: number | null },
  tournamentId?: number,
): Promise<void> {
  const isLL = player1.type === 'LUCKY_LOSER' || player2.type === 'LUCKY_LOSER';

  // Get current match state before updating
  const currentMatch = await sql`SELECT round, position, player1_id, player2_id, player1_type, player2_type FROM bracket_matches WHERE id = ${matchId}`;
  
  let withdrawnPlayerId: number | null = null;
  if (isLL && tournamentId && currentMatch.length > 0) {
    const cm = currentMatch[0];
    if (cm.round === 1) {
      if (player1.type === 'LUCKY_LOSER' && cm.player1_id && cm.player1_id !== player1.id) {
        withdrawnPlayerId = cm.player1_id;
      } else if (player2.type === 'LUCKY_LOSER' && cm.player2_id && cm.player2_id !== player2.id) {
        withdrawnPlayerId = cm.player2_id;
      }
    }
  }

  // Check if we're replacing generic qualifiers with real players
  // This is used to update user predictions that pointed to the generic qualifier
  let resolveQualifierSlot1 = false;
  let resolveQualifierSlot2 = false;
  if (tournamentId && currentMatch.length > 0) {
    const cm = currentMatch[0];
    const genericQualifier = await sql`SELECT id FROM players WHERE name = 'Qualifier' LIMIT 1`;
    const qualifierPlayerId = genericQualifier.length > 0 ? genericQualifier[0].id : null;

    if (qualifierPlayerId) {
      // Slot 1 was a generic qualifier and is now being set to a real player
      const wasSlot1Qualifier = cm.player1_type === 'QUALIFIER' && (!cm.player1_id || cm.player1_id === qualifierPlayerId);
      const isSlot1NowReal = player1.id && player1.id !== qualifierPlayerId;
      if (wasSlot1Qualifier && isSlot1NowReal) {
        resolveQualifierSlot1 = true;
      }

      // Slot 2 was a generic qualifier and is now being set to a real player
      const wasSlot2Qualifier = cm.player2_type === 'QUALIFIER' && (!cm.player2_id || cm.player2_id === qualifierPlayerId);
      const isSlot2NowReal = player2.id && player2.id !== qualifierPlayerId;
      if (wasSlot2Qualifier && isSlot2NowReal) {
        resolveQualifierSlot2 = true;
      }

      // Resolve predictions: update predicted_winner_id from generic qualifier to real player
      if (resolveQualifierSlot1 || resolveQualifierSlot2) {
        // Were both slots qualifiers? If so, use the __SLOT_X__ markers to distinguish
        const bothWereQualifiers = wasSlot1Qualifier && wasSlot2Qualifier;

        if (bothWereQualifiers) {
          // Update predictions that used __SLOT_1__ marker
          if (resolveQualifierSlot1) {
            await resolveQualifierPredictions(matchId, qualifierPlayerId, player1.id!, '__SLOT_1__', tournamentId);
          }
          // Update predictions that used __SLOT_2__ marker
          if (resolveQualifierSlot2) {
            await resolveQualifierPredictions(matchId, qualifierPlayerId, player2.id!, '__SLOT_2__', tournamentId);
          }
        } else {
          // Only one slot was qualifier - no ambiguity, update all predictions for this match
          const newPlayerId = resolveQualifierSlot1 ? player1.id! : player2.id!;
          await sql`
            UPDATE predictions
            SET predicted_winner_id = ${newPlayerId}, predicted_score = NULL
            WHERE bracket_match_id = ${matchId}
            AND predicted_winner_id = ${qualifierPlayerId}
          `;
          // Also update cascaded predictions in subsequent rounds
          await resolveQualifierCascade(matchId, qualifierPlayerId, newPlayerId, tournamentId);
        }
      }
    }
  }

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
  `;

  if (withdrawnPlayerId && tournamentId) {
    await annulPlayerPredictions(tournamentId, withdrawnPlayerId);
  }

  if (tournamentId) {
    await autoAdvanceIfBye(matchId, tournamentId);
  }
}

/**
 * Resolve qualifier predictions for a specific match when both slots were qualifiers.
 * Updates predictions that have the slot marker (__SLOT_1__ or __SLOT_2__) to point to the real player.
 * Also cascades the update to subsequent rounds.
 */
async function resolveQualifierPredictions(
  matchId: number,
  qualifierPlayerId: number,
  realPlayerId: number,
  slotMarker: string,
  tournamentId: number,
) {
  // Update predictions for this specific match that used the slot marker
  await sql`
    UPDATE predictions
    SET predicted_winner_id = ${realPlayerId}, predicted_score = NULL
    WHERE bracket_match_id = ${matchId}
    AND predicted_winner_id = ${qualifierPlayerId}
    AND predicted_score = ${slotMarker}
  `;

  // Cascade: update predictions in subsequent rounds that depended on this qualifier
  await resolveQualifierCascade(matchId, qualifierPlayerId, realPlayerId, tournamentId);
}

/**
 * Cascade qualifier resolution to subsequent rounds.
 * When a qualifier is resolved to a real player in round N, any predictions in rounds N+1, N+2, etc.
 * that have predicted_winner_id = qualifierPlayerId should be updated to the real player.
 * We use the bracket structure (position) to trace the path forward.
 */
async function resolveQualifierCascade(
  matchId: number,
  qualifierPlayerId: number,
  realPlayerId: number,
  tournamentId: number,
) {
  // Get the match details to trace the bracket path
  const matchInfo = await sql`
    SELECT round, position FROM bracket_matches WHERE id = ${matchId}
  `;
  if (matchInfo.length === 0) return;

  let currentRound = matchInfo[0].round as number;
  let currentPos = matchInfo[0].position as number;

  const maxRoundResult = await sql`
    SELECT MAX(round) as max_round FROM bracket_matches WHERE tournament_id = ${tournamentId}
  `;
  const maxRound = maxRoundResult[0]?.max_round || currentRound;

  // Walk forward through the bracket
  while (currentRound < maxRound) {
    const nextRound = currentRound + 1;
    const nextPos = Math.ceil(currentPos / 2);
    // Determine which slot (1 or 2) this match feeds into in the next round
    // Odd positions feed into slot 1, even positions feed into slot 2
    const feedsIntoSlot = currentPos % 2 === 1 ? 1 : 2;
    const slotMarker = `__SLOT_${feedsIntoSlot}__`;

    // Find the next match in the bracket path
    const nextMatch = await sql`
      SELECT id FROM bracket_matches
      WHERE tournament_id = ${tournamentId} AND round = ${nextRound} AND position = ${nextPos}
    `;
    if (nextMatch.length === 0) break;

    const nextMatchId = nextMatch[0].id;

    // First try to update predictions with the specific slot marker
    await sql`
      UPDATE predictions
      SET predicted_winner_id = ${realPlayerId}, predicted_score = NULL
      WHERE bracket_match_id = ${nextMatchId}
      AND predicted_winner_id = ${qualifierPlayerId}
      AND predicted_score = ${slotMarker}
    `;

    // Also update predictions without a slot marker (legacy or non-ambiguous cases)
    // Only if there's no other qualifier in the other slot of this match
    await sql`
      UPDATE predictions
      SET predicted_winner_id = ${realPlayerId}
      WHERE bracket_match_id = ${nextMatchId}
      AND predicted_winner_id = ${qualifierPlayerId}
      AND (predicted_score IS NULL OR predicted_score NOT LIKE '__SLOT_%__')
    `;

    currentRound = nextRound;
    currentPos = nextPos;
  }
}

async function annulPlayerPredictions(tournamentId: number, playerId: number) {
  await sql`
    UPDATE predictions
    SET points_earned = 0, is_correct = FALSE
    WHERE predicted_winner_id = ${playerId}
      AND bracket_match_id IN (
        SELECT id FROM bracket_matches WHERE tournament_id = ${tournamentId}
      )
  `;
}

async function autoAdvanceIfBye(matchId: number, tournamentId: number) {
  const match = await sql`
    SELECT bm.*, t.status as tournament_status
    FROM bracket_matches bm
    JOIN tournaments t ON bm.tournament_id = t.id
    WHERE bm.id = ${matchId}
  `;
  if (match.length === 0) return;

  const m = match[0];
  if (m.tournament_status === 'STANDBY' || m.tournament_status === 'draft') return;

  if (m.player1_type === 'BYE' && m.player2_id) {
    await setMatchResult(m.id, m.player2_id, 'BYE', { isWalkover: true });
  } else if (m.player2_type === 'BYE' && m.player1_id) {
    await setMatchResult(m.id, m.player1_id, 'BYE', { isWalkover: true });
  } else if (m.player1_id && m.player2_id && m.status !== 'completed') {
    await sql`UPDATE bracket_matches SET status = 'scheduled' WHERE id = ${matchId}`;
  }
}

export function calculateSetScore(score: string): string {
  if (!score || score.toUpperCase() === 'BYE') return '';

  // Handle W/O with optional score (e.g., "W/O 6-4")
  const scoreUpper = score.toUpperCase();
  if (scoreUpper === 'W/O' || scoreUpper === 'WALKOVER') return '';

  if (scoreUpper.startsWith('W/O') || scoreUpper.startsWith('WALKOVER')) {
    // Extract score part after W/O or WALKOVER
    const scorePart = score
      .replace(/^W\/O\s*/i, '')
      .replace(/^WALKOVER\s*/i, '')
      .trim();
    if (!scorePart) return ''; // W/O without score

    // Process the score part
    const sets = scorePart.split(/\s+/);
    let p1 = 0;
    let p2 = 0;
    for (const set of sets) {
      const games = set.split('-').map(Number);
      if (games.length === 2 && !isNaN(games[0]) && !isNaN(games[1])) {
        if (games[0] > games[1]) p1++;
        else if (games[1] > games[0]) p2++;
      }
    }
    return p1 >= p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
  }

  // Regular score handling
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

export function validateTennisScore(
  score: string,
  setsToWin: number,
): { valid: boolean; winner?: 1 | 2; error?: string } {
  const scoreUpper = score.toUpperCase();

  // Handle pure W/O or WALKOVER (no score)
  if (scoreUpper === 'W/O' || scoreUpper === 'WALKOVER') {
    return { valid: true };
  }

  // Handle W/O with optional score (e.g., "W/O 6-4")
  if (scoreUpper.startsWith('W/O') || scoreUpper.startsWith('WALKOVER')) {
    const scorePart = score
      .replace(/^W\/O\s*/i, '')
      .replace(/^WALKOVER\s*/i, '')
      .trim();

    // If no score part after W/O, it's valid (just a W/O)
    if (!scorePart) return { valid: true };

    // If there is a score part, validate it like a regular score
    const sets = scorePart.split(/\s+/);
    let player1Sets = 0;
    let player2Sets = 0;

    for (const set of sets) {
      const games = set.split('-').map(Number);
      if (games.length !== 2 || isNaN(games[0]) || isNaN(games[1])) {
        return { valid: false, error: 'Invalid set score: ' + set };
      }
      const [g1, g2] = games;
      if (g1 < 0 || g2 < 0) return { valid: false, error: 'Games cannot be negative' };

      const isSetFinished =
        ((g1 >= 6 || g2 >= 6) && Math.abs(g1 - g2) >= 2) || (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);

      if (!isSetFinished) return { valid: false, error: 'Incomplete or invalid set: ' + set };
      if (g1 > 7 || g2 > 7) return { valid: false, error: 'Impossible score: ' + set };
      if ((g1 === 7 && g2 < 5) || (g2 === 7 && g1 < 5)) return { valid: false, error: 'Invalid score: ' + set };

      if (g1 > g2) player1Sets++;
      else player2Sets++;

      if (player1Sets === setsToWin || player2Sets === setsToWin) {
        if (sets.indexOf(set) !== sets.length - 1) {
          return { valid: false, error: 'Extra sets after winner decided' };
        }
        return { valid: true, winner: player1Sets === setsToWin ? 1 : 2 };
      }
    }

    return { valid: false, error: 'Incomplete match. Need ' + setsToWin + ' sets to win' };
  }

  // Regular score validation
  const sets = score.trim().split(/\s+/);
  let player1Sets = 0;
  let player2Sets = 0;

  for (const set of sets) {
    const games = set.split('-').map(Number);
    if (games.length !== 2 || isNaN(games[0]) || isNaN(games[1])) {
      return { valid: false, error: 'Invalid set score: ' + set };
    }
    const [g1, g2] = games;
    if (g1 < 0 || g2 < 0) return { valid: false, error: 'Games cannot be negative' };

    const isSetFinished =
      ((g1 >= 6 || g2 >= 6) && Math.abs(g1 - g2) >= 2) || (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);

    if (!isSetFinished) return { valid: false, error: 'Incomplete or invalid set: ' + set };
    if (g1 > 7 || g2 > 7) return { valid: false, error: 'Impossible score: ' + set };
    if ((g1 === 7 && g2 < 5) || (g2 === 7 && g1 < 5)) return { valid: false, error: 'Invalid score: ' + set };

    if (g1 > g2) player1Sets++;
    else player2Sets++;

    if (player1Sets === setsToWin || player2Sets === setsToWin) {
      if (sets.indexOf(set) !== sets.length - 1) {
        return { valid: false, error: 'Extra sets after winner decided' };
      }
      return { valid: true, winner: player1Sets === setsToWin ? 1 : 2 };
    }
  }

  return { valid: false, error: 'Incomplete match. Need ' + setsToWin + ' sets to win' };
}

export async function setMatchResult(
  matchId: number,
  winnerId: number,
  score: string,
  options?: { isWalkover?: boolean },
): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  try {
    const matchData = await sql`
      SELECT bm.*, t.sets_format, t.size, t.status as tournament_status, t.category
      FROM bracket_matches bm
      JOIN tournaments t ON bm.tournament_id = t.id
      WHERE bm.id = ${matchId}
    `;
    if (matchData.length === 0) return { success: false, error: t('adminMatchNotFound') };

    const m = matchData[0];
    const round = m.round as number;
    const position = m.position as number;
    const tournamentId = m.tournament_id as number;
    const category = m.category || 'GRAND_SLAM';
    const pointsCancelled = m.points_cancelled === true;
    // const setsToWin = m.sets_format === 5 ? 3 : 2
    const totalRounds = Math.ceil(Math.log2(m.size as number));

    if (m.tournament_status === 'finished' || m.tournament_status === 'completed' || m.tournament_status === 'FINISHED') {
      return { success: false, error: t('adminTournamentFinishedLocked') };
    }

    if (
      m.tournament_status === 'draft' ||
      m.tournament_status === 'upcoming' ||
      m.tournament_status === 'STANDBY' ||
      m.tournament_status === 'UPCOMING'
    ) {
      return { success: false, error: t('adminPublishBeforeResults') };
    }

    // Validation: Ensure winnerId is one of the players in this match
    if (winnerId !== m.player1_id && winnerId !== m.player2_id) {
      return { success: false, error: t('adminWinnerNotInMatch') };
    }

    // if (!options?.isWalkover) {
    //   const validation = validateTennisScore(score, setsToWin)
    //   if (!validation.valid) return { success: false, error: validation.error }

    //   // If validation returned a winner based on score, ensure it matches winnerId
    //   if (validation.winner) {
    //     const expectedWinnerId = validation.winner === 1 ? m.player1_id : m.player2_id
    //     if (winnerId !== expectedWinnerId) {
    //       return { success: false, error: t('adminWinnerScoreMismatch') }
    //     }
    //   }
    // }

    const isBye = score === 'BYE';
    const isWalkover =
      score.toUpperCase() === 'W/O' ||
      score.toUpperCase() === 'WALKOVER' ||
      score.toUpperCase().startsWith('W/O ') ||
      score.toUpperCase().startsWith('WALKOVER ') ||
      options?.isWalkover;

    // LL rule: points are only cancelled if the Lucky Loser player WINS the match.
    // If the LL player loses, scoring is credited normally.
    const winnerIsLL =
      (winnerId === m.player1_id && m.player1_type === 'LUCKY_LOSER') ||
      (winnerId === m.player2_id && m.player2_type === 'LUCKY_LOSER');
    const effectivePointsCancelled = pointsCancelled || winnerIsLL;

    const points =
      effectivePointsCancelled || isBye || isWalkover
        ? 0
        : getMatchPoints(category, round, totalRounds, m.size as number);

    // Update match result
    const shouldCancelPoints = isWalkover || winnerIsLL;
    await sql`
      UPDATE bracket_matches 
      SET winner_id = ${winnerId}, 
          score = ${score}, 
          status = 'completed', 
          points_cancelled = CASE 
            WHEN ${shouldCancelPoints}::boolean THEN TRUE 
            ELSE points_cancelled 
          END,
          updated_at = NOW()
      WHERE id = ${matchId}
    `;

    if (round < totalRounds) {
      // Regular rounds: Update predictions
      await sql`
        UPDATE predictions
        SET is_correct = (predicted_winner_id = ${winnerId}),
            points_earned = CASE
              WHEN ${effectivePointsCancelled} THEN 0
              WHEN predicted_winner_id = ${winnerId} THEN ${points}
              ELSE 0
            END
        WHERE bracket_match_id = ${matchId}
      `;
      // Advance winner to next round
      await advancePlayer(tournamentId, round, position, winnerId);
    } else {
      // Final round completed
      const runnerUpId = m.player1_id === winnerId ? m.player2_id : m.player1_id;

      // Special scoring for final
      const catConfig = getPointsConfig(category, m.size as number);
      const championPoints = catConfig.rounds[catConfig.rounds.length - 1];
      const runnerUpPoints = catConfig.runnerUp;
      const actualSetScore = calculateSetScore(score);

      // To calculate runner-up points, we need to know who each user predicted would reach the final
      // The predicted runner-up is the winner of the OTHER semifinal in their bracket.

      const semiMatches = await sql`
        SELECT id, round, position FROM bracket_matches
        WHERE tournament_id = ${tournamentId} AND round = ${totalRounds - 1}
      `;

      const userPredictions = await sql`
        SELECT p.user_id, p.bracket_match_id, p.predicted_winner_id, p.predicted_score
        FROM predictions p
        JOIN bracket_matches bm ON p.bracket_match_id = bm.id
        WHERE bm.tournament_id = ${tournamentId} AND bm.round IN (${totalRounds}, ${totalRounds - 1})
      `;

      // Group by user
      const byUser: Record<number, any> = {};
      for (const p of userPredictions) {
        if (!byUser[p.user_id]) byUser[p.user_id] = {};
        byUser[p.user_id][p.bracket_match_id] = {
          winner_id: p.predicted_winner_id,
          score: p.predicted_score,
        };
      }

      for (const userId of Object.keys(byUser)) {
        const uId = parseInt(userId);
        const preds = byUser[uId];
        const finalPred = preds[matchId];

        // Find the two semi match IDs
        const semi1Id = semiMatches.find((s) => s.position === 1)?.id;
        const semi2Id = semiMatches.find((s) => s.position === 2)?.id;

        const semi1Winner = preds[semi1Id!]?.winner_id;
        const semi2Winner = preds[semi2Id!]?.winner_id;

        const predictedChampion = finalPred?.winner_id;
        const predictedRunnerUp = predictedChampion === semi1Winner ? semi2Winner : semi1Winner;

        let finalPoints = 0;
        let isRunnerUpCorrect = false;

        if (predictedChampion === winnerId) {
          finalPoints = effectivePointsCancelled || isBye || isWalkover ? 0 : (championPoints ?? 0);

          if (predictedRunnerUp === runnerUpId) {
            isRunnerUpCorrect = true;
          }
        } else if (predictedRunnerUp === runnerUpId) {
          finalPoints = effectivePointsCancelled || isBye || isWalkover ? 0 : runnerUpPoints;
          isRunnerUpCorrect = true;
        }

        await sql`
          UPDATE predictions
          SET is_correct = (predicted_winner_id = ${winnerId}),
              points_earned = ${finalPoints},
              is_runner_up_correct = ${isRunnerUpCorrect}
          WHERE bracket_match_id = ${matchId} AND user_id = ${uId}
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting match result:', error);
    return { success: false, error: t('adminSaveResultFailed') };
  }
}

export async function clearMatchResult(matchId: number): Promise<{
  success: boolean; error?: string }> {
  const t = await getTranslations('errors');
  try {
    const matchData = await sql`
      SELECT bm.*, t.status as tournament_status, t.size
      FROM bracket_matches bm
      JOIN tournaments t ON bm.tournament_id = t.id
      WHERE bm.id = ${matchId}
    `;
    if (matchData.length === 0) return { success: false, error: t('adminMatchNotFound') };

    const m = matchData[0];
    const tournamentId = m.tournament_id as number;
    const round = m.round as number;
    const position = m.position as number;
    const size = m.size as number;
    const totalRounds = Math.ceil(Math.log2(size));

    if (
      m.tournament_status === 'finished' ||
      m.tournament_status === 'completed' ||
      m.tournament_status === 'FINISHED'
    ) {
      // Revert tournament status if it was finished
      await sql`
        UPDATE tournaments
        SET status = 'IN_PROGRESS', champion_id = NULL, runner_up_id = NULL, updated_at = NOW()
        WHERE id = ${tournamentId}
      `;
    }

    // Reset match result
    const newStatus = m.player1_id && m.player2_id ? 'scheduled' : 'pending';
    await sql`
      UPDATE bracket_matches
      SET winner_id = NULL, score = NULL, status = ${newStatus}, updated_at = NOW()
      WHERE id = ${matchId}
    `;

    // Reset predictions for this match
    await sql`
      UPDATE predictions
      SET is_correct = NULL, points_earned = 0
      WHERE bracket_match_id = ${matchId}
    `;

    // Remove player from next round (cascade)
    if (round < totalRounds) {
      await advancePlayer(tournamentId, round, position, null);
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing match result:', error);
    return { success: false, error: t('adminClearResultFailed') };
  }
}

async function advancePlayer(
  tournamentId: number,
  currentRound: number,
  currentPosition: number,
  winnerId: number | null,
) {
  const nextRound = currentRound + 1;
  const nextPosition = Math.ceil(currentPosition / 2);
  const isPlayer1Slot = currentPosition % 2 === 1;

  // Get current match data to preserve winner's identity (type/seed)
  const currentMatch = await sql`
    SELECT player1_id, player1_type, player1_seed, player2_id, player2_type, player2_seed
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = ${currentRound} AND position = ${currentPosition}
  `;

  let winnerType = 'PLAYER';
  let winnerSeed = null;

  if (winnerId && currentMatch.length > 0) {
    const cm = currentMatch[0];
    if (cm.player1_id === winnerId) {
      winnerType = cm.player1_type;
      winnerSeed = cm.player1_seed;
    } else if (cm.player2_id === winnerId) {
      winnerType = cm.player2_type;
      winnerSeed = cm.player2_seed;
    }
  }

  const nextMatch = await sql`
    SELECT bm.id, bm.player1_id, bm.player2_id, bm.player1_type, bm.player2_type, bm.status, t.size
    FROM bracket_matches bm
    JOIN tournaments t ON bm.tournament_id = t.id
    WHERE bm.tournament_id = ${tournamentId} AND bm.round = ${nextRound} AND bm.position = ${nextPosition}
  `;

  if (nextMatch.length > 0) {
    const nm = nextMatch[0];
    const nextMatchId = nm.id;

    // If we are advancing a winner, but the match was already completed, we need to reset it
    // especially if the participant is changing.
    const playerChanged = isPlayer1Slot ? nm.player1_id !== winnerId : nm.player2_id !== winnerId;

    if (isPlayer1Slot) {
      await sql`UPDATE bracket_matches SET player1_id = ${winnerId}, player1_type = ${winnerType}, player1_seed = ${winnerSeed}, updated_at = NOW() WHERE id = ${nextMatchId}`;
    } else {
      await sql`UPDATE bracket_matches SET player2_id = ${winnerId}, player2_type = ${winnerType}, player2_seed = ${winnerSeed}, updated_at = NOW() WHERE id = ${nextMatchId}`;
    }

    if (nm.status === 'completed' && playerChanged) {
      // Reset this match because one of the participants changed
      await sql`UPDATE bracket_matches SET status = 'pending', winner_id = NULL, score = NULL, updated_at = NOW() WHERE id = ${nextMatchId}`;
      await sql`UPDATE predictions SET is_correct = NULL, points_earned = 0 WHERE bracket_match_id = ${nextMatchId}`;

      // Cascade reset to next rounds
      const totalRounds = Math.ceil(Math.log2(nm.size));
      if (nextRound < totalRounds) {
        await advancePlayer(tournamentId, nextRound, nextPosition, null);
      }
    }

    // Only proceed with auto-advancement if we have a winnerId
    if (winnerId) {
      const updatedMatch = await sql`SELECT * FROM bracket_matches WHERE id = ${nextMatchId}`;
      const um = updatedMatch[0];

      if (um.player1_id && um.player2_type === 'BYE') {
        await setMatchResult(nextMatchId, um.player1_id, 'BYE', { isWalkover: true });
      } else if (um.player2_id && um.player1_type === 'BYE') {
        await setMatchResult(nextMatchId, um.player2_id, 'BYE', { isWalkover: true });
      } else if (um.player1_id && um.player2_id && um.status !== 'completed') {
        await sql`UPDATE bracket_matches SET status = 'scheduled' WHERE id = ${nextMatchId}`;
      }
    }
  }
}

export async function publishTournament(tournamentId: number): Promise<void> {
  const t = await getTranslations('errors');
  const tournament = await sql`SELECT size FROM tournaments WHERE id = ${tournamentId}`;
  if (tournament.length === 0) throw new Error(t('adminTournamentNotFound'));

  // 1. Mark tournament as active
  await sql`UPDATE tournaments SET status = 'OPEN', updated_at = NOW() WHERE id = ${tournamentId}`;

  // 2. Resolve BYEs in the first round (and potentially auto-advanced matches)
  const matches = await sql`
    SELECT id FROM bracket_matches
    WHERE tournament_id = ${tournamentId}
    ORDER BY round ASC
  `;

  for (const match of matches) {
    await autoAdvanceIfBye(match.id, tournamentId);
  }
}

export async function updatePlaceholderPlayer(
  matchId: number,
  slot: 1 | 2,
  playerId: number,
  tournamentId: number,
  isLL?: boolean,
): Promise<void> {
  const matchData = await sql`
    SELECT round, position, status, player1_id, player2_id, player1_type, player2_type
    FROM bracket_matches
    WHERE id = ${matchId}
  `;
  if (matchData.length === 0) return;
  const m = matchData[0];

  let withdrawnPlayerId: number | null = null;
  if (isLL && m.round === 1) {
    if (slot === 1 && m.player1_id && m.player1_id !== playerId) {
      withdrawnPlayerId = m.player1_id;
    } else if (slot === 2 && m.player2_id && m.player2_id !== playerId) {
      withdrawnPlayerId = m.player2_id;
    }
  }

  if (slot === 1) {
    await sql`
      UPDATE bracket_matches
      SET player1_id = ${playerId},
          player1_type = CASE WHEN ${isLL} THEN 'LUCKY_LOSER' ELSE player1_type END,
          updated_at = NOW()
      WHERE id = ${matchId}
    `;
  } else {
    await sql`
      UPDATE bracket_matches
      SET player2_id = ${playerId},
          player2_type = CASE WHEN ${isLL} THEN 'LUCKY_LOSER' ELSE player2_type END,
          updated_at = NOW()
      WHERE id = ${matchId}
    `;
  }

  // Transfer predictions from generic Qualifier to the new player.
  // When both sides were qualifiers, keep the user's original slot choice.
  try {
    const genericQualifier = await sql`SELECT id FROM players WHERE name = 'Qualifier' LIMIT 1`;
    const qualifierPlayerId = genericQualifier.length > 0 ? genericQualifier[0].id : null;

    if (qualifierPlayerId) {
      const wasSlot1Qualifier = m.player1_type === 'QUALIFIER' && (!m.player1_id || m.player1_id === qualifierPlayerId);
      const wasSlot2Qualifier = m.player2_type === 'QUALIFIER' && (!m.player2_id || m.player2_id === qualifierPlayerId);
      const updatedSlotWasQualifier = slot === 1 ? wasSlot1Qualifier : wasSlot2Qualifier;

      if (updatedSlotWasQualifier) {
        if (wasSlot1Qualifier && wasSlot2Qualifier) {
          await resolveQualifierPredictions(
            matchId,
            qualifierPlayerId,
            playerId,
            slot === 1 ? '__SLOT_1__' : '__SLOT_2__',
            tournamentId,
          );
        } else {
          await sql`
            UPDATE predictions
            SET predicted_winner_id = ${playerId}, predicted_score = NULL
            WHERE bracket_match_id = ${matchId}
            AND predicted_winner_id = ${qualifierPlayerId}
          `;
          await resolveQualifierCascade(matchId, qualifierPlayerId, playerId, tournamentId);
        }
      }
    }
  } catch (err) {
    console.error('Error transferring qualifier predictions:', err);
  }

  if (m.status === 'completed') {
    // Reset match result
    await sql`
      UPDATE bracket_matches
      SET winner_id = NULL, score = NULL, status = 'pending', updated_at = NOW()
      WHERE id = ${matchId}
    `;

    // Reset predictions for this match
    await sql`
      UPDATE predictions
      SET is_correct = NULL, points_earned = 0
      WHERE bracket_match_id = ${matchId}
    `;

    // Cascade reset to next rounds
    await advancePlayer(tournamentId, m.round, m.position, null);
  }

  if (withdrawnPlayerId) {
    await annulPlayerPredictions(tournamentId, withdrawnPlayerId);
  }

  if (tournamentId) {
    await autoAdvanceIfBye(matchId, tournamentId);
  }
}

async function recalculateMatchPoints(matchId: number): Promise<void> {
  const matchData = await sql`
    SELECT bm.*, t.size, t.category
    FROM bracket_matches bm
    JOIN tournaments t ON bm.tournament_id = t.id
    WHERE bm.id = ${matchId}
  `;
  if (matchData.length === 0 || matchData[0].status !== 'completed') return;

  const m = matchData[0];
  const round = m.round as number;
  const tournamentId = m.tournament_id as number;
  const category = m.category || 'GRAND_SLAM';
  const winnerId = m.winner_id;
  const score = m.score;
  const totalRounds = Math.ceil(Math.log2(m.size as number));
  const isBye = score === 'BYE';
  const points = isBye ? 0 : getMatchPoints(category, round, totalRounds, m.size as number);

  if (round < totalRounds) {
    // Regular rounds: Recalculate based on winner
    await sql`
      UPDATE predictions
      SET points_earned = CASE
            WHEN predicted_winner_id = ${winnerId} THEN ${points}
            ELSE 0
          END
      WHERE bracket_match_id = ${matchId}
    `;
  } else {
    // Final round: Recalculate champion and runner-up points
    const runnerUpId = m.player1_id === winnerId ? m.player2_id : m.player1_id;
    const catConfig = getPointsConfig(category, m.size as number);
    const championPoints = catConfig.rounds[catConfig.rounds.length - 1];
    const runnerUpPoints = catConfig.runnerUp;

    const semiMatches = await sql`
      SELECT id, round, position FROM bracket_matches
      WHERE tournament_id = ${tournamentId} AND round = ${totalRounds - 1}
    `;

    const userPredictions = await sql`
      SELECT p.user_id, p.bracket_match_id, p.predicted_winner_id
      FROM predictions p
      JOIN bracket_matches bm ON p.bracket_match_id = bm.id
      WHERE bm.tournament_id = ${tournamentId} AND bm.round IN (${totalRounds}, ${totalRounds - 1})
    `;

    const byUser: Record<number, any> = {};
    for (const p of userPredictions) {
      if (!byUser[p.user_id]) byUser[p.user_id] = {};
      byUser[p.user_id][p.bracket_match_id] = { winner_id: p.predicted_winner_id };
    }

    const semi1Id = semiMatches.find((s) => s.position === 1)?.id;
    const semi2Id = semiMatches.find((s) => s.position === 2)?.id;

    for (const userId of Object.keys(byUser)) {
      const uId = parseInt(userId);
      const preds = byUser[uId];
      const finalPred = preds[matchId];

      const semi1Winner = preds[semi1Id!]?.winner_id;
      const semi2Winner = preds[semi2Id!]?.winner_id;

      const predictedChampion = finalPred?.winner_id;
      const predictedRunnerUp = predictedChampion === semi1Winner ? semi2Winner : semi1Winner;

      let finalPoints = 0;
      if (predictedChampion === winnerId) {
        finalPoints = championPoints ?? 0;
      } else if (predictedRunnerUp === runnerUpId) {
        finalPoints = runnerUpPoints;
      }

      await sql`
        UPDATE predictions
        SET points_earned = ${finalPoints}
        WHERE bracket_match_id = ${matchId} AND user_id = ${uId}
      `;
    }
  }
}

export async function cancelMatchPoints(matchId: number, cancelled: boolean): Promise<void> {
  await sql`UPDATE bracket_matches SET points_cancelled = ${cancelled}, updated_at = NOW() WHERE id = ${matchId}`;

  if (cancelled) {
    // If cancelling, reset points for this match in all predictions
    await sql`UPDATE predictions SET points_earned = 0 WHERE bracket_match_id = ${matchId}`;
  } else {
    // If un-cancelling, re-calculate points.
    await recalculateMatchPoints(matchId);
  }
}

// ==================== USER MANAGEMENT ====================

export async function getAllUsers(options?: { search?: string; state?: string; city?: string; club?: string; limit?: number; offset?: number }) {
  const search = options?.search ? `%${options.search}%` : null;
  const stateFilter = options?.state || null;
  const cityFilter = options?.city || null;
  const clubFilter = options?.club || null;
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const users = await sql`
    SELECT u.id, u.name, u.email, u.nickname, u.whatsapp,
      COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) as tennis_club,
      u.tennis_club_id,
      u.tennis_club_custom,
      COALESCE(u.country, 'Brasil') as country,
      u.state, u.city, u.is_admin, u.is_active, u.is_deleted, u.created_at,
      COUNT(p.id) as total_predictions
    FROM users u
    LEFT JOIN tennis_clubs tc ON tc.id = u.tennis_club_id
    LEFT JOIN predictions p ON u.id = p.user_id
    WHERE u.is_deleted = FALSE
      AND (${search}::text IS NULL OR u.name ILIKE ${search} OR u.email ILIKE ${search} OR u.nickname ILIKE ${search})
      AND (${stateFilter}::text IS NULL OR u.state = ${stateFilter})
      AND (${cityFilter}::text IS NULL OR u.city = ${cityFilter})
      AND (${clubFilter}::text IS NULL OR COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) = ${clubFilter})
    GROUP BY u.id, u.name, u.email, u.nickname, u.whatsapp, tc.name, u.tennis_club, u.tennis_club_id, u.tennis_club_custom, u.country, u.state, u.city, u.is_admin, u.is_active, u.is_deleted, u.created_at
  `;
  return sortByPtBrText(users, (user) => user.name as string).slice(offset, offset + limit);
}

export async function countAllUsers(options?: { search?: string; state?: string; city?: string; club?: string }) {
  const search = options?.search ? `%${options.search}%` : null;
  const stateFilter = options?.state || null;
  const cityFilter = options?.city || null;
  const clubFilter = options?.club || null;

  const result = await sql`
    SELECT COUNT(*) as count
    FROM users u
    LEFT JOIN tennis_clubs tc ON tc.id = u.tennis_club_id
    WHERE u.is_deleted = FALSE
      AND (${search}::text IS NULL OR u.name ILIKE ${search} OR u.email ILIKE ${search} OR u.nickname ILIKE ${search})
      AND (${stateFilter}::text IS NULL OR u.state = ${stateFilter})
      AND (${cityFilter}::text IS NULL OR u.city = ${cityFilter})
      AND (${clubFilter}::text IS NULL OR COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) = ${clubFilter})
  `;
  return Number(result[0].count);
}

export async function getUserFilterOptions() {
  const [states, cities, clubs] = await Promise.all([
    sql`SELECT DISTINCT state FROM users WHERE is_deleted = FALSE AND state IS NOT NULL AND state != ''`,
    sql`SELECT DISTINCT city FROM users WHERE is_deleted = FALSE AND city IS NOT NULL AND city != ''`,
    sql`
      SELECT DISTINCT COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) as tennis_club
      FROM users u
      LEFT JOIN tennis_clubs tc ON tc.id = u.tennis_club_id
      WHERE u.is_deleted = FALSE
        AND COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) IS NOT NULL
        AND COALESCE(tc.name, u.tennis_club_custom, u.tennis_club) != ''
    `,
  ]);

  return {
    states: sortByPtBrText(states, (r) => r.state as string).map((r) => r.state as string),
    cities: sortByPtBrText(cities, (r) => r.city as string).map((r) => r.city as string),
    clubs: sortByPtBrText(clubs, (r) => r.tennis_club as string).map((r) => r.tennis_club as string),
  };
}

export async function getAdminStats() {
  const [needsReview, newUsers, topTournaments, totalPredictions] = await Promise.all([
    // Tournaments needing review
    sql`SELECT COUNT(*) as count FROM tournaments WHERE needs_review = TRUE`,

    // New users in last 7 days
    sql`SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days' AND is_deleted = FALSE`,

    // Top tournaments by engagement
    sql`
      SELECT t.id, t.name, t.status, COUNT(ut.user_id) as participants
      FROM tournaments t
      LEFT JOIN user_tournaments ut ON t.id = ut.tournament_id
      WHERE t.status IN ('OPEN', 'active', 'published', 'UPCOMING', 'upcoming', 'LOCKED', 'IN_PROGRESS')
      GROUP BY t.id, t.name, t.status
      ORDER BY participants DESC
      LIMIT 5
    `,

    // Matches with pending results that should have been completed
    // (A match is considered "overdue" if it has players and is in a round that should have started)
    // For simplicity, we'll just count pending matches in non-draft tournaments
    sql`
      SELECT COUNT(*) as count
      FROM bracket_matches bm
      JOIN tournaments t ON bm.tournament_id = t.id
      WHERE bm.status != 'completed'
        AND bm.player1_id IS NOT NULL
        AND bm.player2_id IS NOT NULL
        AND t.status IN ('LOCKED', 'IN_PROGRESS')
    `,

    // Total predictions count
    sql`SELECT COUNT(*) as count FROM predictions`,
  ]);

  return {
    needsReview: Number(needsReview[0]?.count || 0),
    newUsers7d: Number(newUsers[0]?.count || 0),
    topTournaments: topTournaments.map((t) => ({
      id: t.id as number,
      name: t.name as string,
      status: t.status as string,
      participants: Number(t.participants || 0),
    })),
    totalPredictions: Number(totalPredictions[0]?.count || 0),
  };
}

export async function updateUser(
  id: number,
  data: {
    name: string;
    email: string;
    nickname?: string;
    whatsapp: string;
    tennis_club: string;
    tennis_club_id?: number | null;
    tennis_club_custom?: string | null;
    country: string;
    state: string;
    city: string;
  },
): Promise<void> {
  await sql`
    UPDATE users
    SET name = ${data.name}, email = ${data.email}, nickname = ${data.nickname || null}, whatsapp = ${data.whatsapp}, tennis_club = ${data.tennis_club}, tennis_club_id = ${data.tennis_club_id || null}, tennis_club_custom = ${data.tennis_club_custom || null}, country = ${data.country}, state = ${data.state ?? ''}, city = ${data.city ?? ''}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function toggleUserStatus(id: number, isActive: boolean): Promise<void> {
  await sql`UPDATE users SET is_active = ${isActive}, updated_at = NOW() WHERE id = ${id}`;
}

export async function toggleTournamentVisibility(id: number, isVisible: boolean): Promise<void> {
  await sql`UPDATE tournaments SET is_visible = ${isVisible}, updated_at = NOW() WHERE id = ${id}`;
}

export async function softDeleteUser(id: number): Promise<void> {
  await sql`UPDATE users SET is_deleted = TRUE, is_active = FALSE WHERE id = ${id}`;
}

// ==================== METADATA MANAGEMENT ====================

export async function createTournamentName(name: string): Promise<number> {
  const result = await sql`INSERT INTO tournament_names (name) VALUES (${name}) RETURNING id`;
  return result[0].id as number;
}

export async function updateTournamentName(id: number, name: string): Promise<void> {
  await sql`UPDATE tournament_names SET name = ${name} WHERE id = ${id}`;
}

export async function deleteTournamentName(id: number): Promise<void> {
  await sql`DELETE FROM tournament_names WHERE id = ${id}`;
}

export async function createTournamentLocation(name: string): Promise<number> {
  const result = await sql`INSERT INTO tournament_locations (name) VALUES (${name}) RETURNING id`;
  return result[0].id as number;
}

export async function updateTournamentLocation(id: number, name: string): Promise<void> {
  await sql`UPDATE tournament_locations SET name = ${name} WHERE id = ${id}`;
}

export async function deleteTournamentLocation(id: number): Promise<void> {
  await sql`DELETE FROM tournament_locations WHERE id = ${id}`;
}

export async function isRound1Complete(tournamentId: number): Promise<boolean> {
  const matches = await sql`
    SELECT player1_id, player1_type, player2_id, player2_type
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND round = 1
  `;

  if (matches.length === 0) return false;

  return matches.every((m) => {
    // Both types must be defined
    if (!m.player1_type || !m.player2_type) return false;

    // If type is PLAYER or SEED, id must be defined
    if ((m.player1_type === 'PLAYER' || m.player1_type === 'SEED') && !m.player1_id) return false;
    if ((m.player2_type === 'PLAYER' || m.player2_type === 'SEED') && !m.player2_id) return false;

    return true;
  });
}

export interface AdminPoolEntry {
  id: number | string;
  name: string;
  description: string | null;
  creator_id: number | null;
  creator_name: string | null;
  is_general: boolean;
  is_state_pool?: boolean;
  tournament_id: number | null;
  tournament_name: string | null;
  member_count: number;
  created_at: string;
}

export async function getAllPoolsAdmin(): Promise<AdminPoolEntry[]> {
  const rows = await sql`
    SELECT 
      p.*, 
      u.name as creator_name,
      t.name as tournament_name,
      COUNT(pm.user_id)::int as member_count
    FROM pools p
    LEFT JOIN users u ON p.creator_id = u.id
    LEFT JOIN tournaments t ON p.tournament_id = t.id
    LEFT JOIN pool_members pm ON p.id = pm.pool_id
    GROUP BY p.id, u.name, t.name
    ORDER BY p.is_general DESC, p.created_at DESC
  `;
  return rows as unknown as AdminPoolEntry[];
}
