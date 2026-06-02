import { sql } from './db';

// Migration: Add tournament_id, hide_pending and whatsapp_link to pools
sql`ALTER TABLE pools ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id)`.catch(console.error);
sql`ALTER TABLE pools ADD COLUMN IF NOT EXISTS hide_pending BOOLEAN DEFAULT TRUE`.catch(console.error);
sql`ALTER TABLE pools ADD COLUMN IF NOT EXISTS whatsapp_link TEXT`.catch(console.error);

// ==================== INTERFACES ====================

export interface Tournament {
  id: number;
  name: string;
  surface: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  status: string;
  created_at: string;
  category: string;
  category_custom: string | null;
  format: string;
  sets_format: number;
  size: number;
  has_seeds: boolean;
  has_qualifiers: boolean;
  has_wildcards: boolean;
  has_byes: boolean;
  is_visible: boolean;
  champion_id: number | null;
  runner_up_id: number | null;
}

export interface Player {
  id: number;
  name: string;
  display_name: string | null;
  country: string | null;
  seed: number | null;
}

export interface TournamentMetadata {
  id: number;
  name: string;
}

export interface BracketMatch {
  id: number;
  tournament_id: number;
  round: number;
  position: number;
  player1_id: number | null;
  player2_id: number | null;
  winner_id: number | null;
  score: string | null;
  match_date: string | null;
  status: string;
  player1_type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN';
  player2_type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN';
  player1_seed: number | null;
  player2_seed: number | null;
  points_cancelled: boolean;
  // Joined player names
  player1_name: string | null;
  player1_display_name: string | null;
  player1_country: string | null;
  player1_seed_val: number | null; // Renamed from player1_seed to avoid conflict with bracket_matches.player1_seed
  player2_name: string | null;
  player2_display_name: string | null;
  player2_country: string | null;
  player2_seed_val: number | null;
  winner_name: string | null;
  winner_display_name: string | null;
}

export interface Prediction {
  id: number;
  user_id: number;
  bracket_match_id: number;
  predicted_winner_id: number;
  predicted_score: string | null;
  is_correct: boolean | null;
  is_runner_up_correct: boolean | null;
  points_earned: number;
  created_at: string;
}

export interface TournamentStats {
  tournament_id: number;
  tournament_name: string;
  points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy: number;
}

export interface UserStats {
  total_points: number;
  correct_predictions: number;
  wrong_predictions: number;
  total_predictions: number;
  accuracy: number;
  active_tournaments: number;
  tournament_stats?: TournamentStats[];
}

export interface RankingEntry {
  user_id: number;
  user_name: string;
  correct_predictions: number;
  total_predictions: number;
  total_points: number;
  rank: number | null;
  final_score_correct?: boolean;
  hit_champion?: boolean;
  hit_both?: boolean;
  global_points?: number;
  has_predictions?: boolean;
}

export interface PredictionWithDetails {
  id: number;
  bracket_match_id: number;
  predicted_winner_id: number;
  predicted_winner_name: string;
  predicted_score: string | null;
  is_correct: boolean | null;
  points_earned: number;
  created_at: string;
  player1_name: string | null;
  player2_name: string | null;
  player1_type: string;
  player2_type: string;
  player1_seed: number | null;
  player2_seed: number | null;
  round: number;
  match_date: string | null;
  score: string | null;
  match_status: string;
  winner_name: string | null;
  tournament_id: number;
  tournament_name: string;
  tournament_size: number;
}

// ==================== ROUND CONFIG ====================

export const ROUND_MATCHES: Record<number, number> = {
  1: 64,
  2: 32,
  3: 16,
  4: 8,
  5: 4,
  6: 2,
  7: 1,
};

export const ROUND_POINTS: Record<number, number> = {
  1: 10,
  2: 45,
  3: 90,
  4: 180,
  5: 360,
  6: 720,
  7: 2000,
};

export type PointsConfig = {
  rounds: Array<number | null>;
  runnerUp: number;
};

export type PointsVariant = PointsConfig & {
  id: string;
  name: string;
  description: string;
};

export const POINTS_CONFIG: Record<string, PointsConfig> = {
  GRAND_SLAM: {
    rounds: [0, 50, 100, 200, 400, 800, 1300, 2000],
    runnerUp: 0,
  },
  MASTERS_1000: {
    rounds: [0, 30, 50, 100, 200, 400, 650, 1000],
    runnerUp: 0,
  },
  ATP_500: {
    rounds: [null, 0, 25, 50, 100, 200, 330, 500],
    runnerUp: 0,
  },
  ATP_250: {
    rounds: [null, 0, 13, 25, 50, 100, 165, 250],
    runnerUp: 0,
  },
};

export const POINTS_VARIANTS: PointsVariant[] = [
  {
    id: 'GRAND_SLAM',
    name: 'Grand Slam',
    description: 'Australian Open, Roland Garros, Wimbledon, US Open',
    rounds: [0, 50, 100, 200, 400, 800, 1300, 2000],
    runnerUp: 0,
  },
  {
    id: 'MASTERS_1000_96',
    name: 'Masters 1000 (96)',
    description: 'Indian Wells, Miami, Madrid, Rome, etc.',
    rounds: [0, 30, 50, 100, 200, 400, 650, 1000],
    runnerUp: 0,
  },
  {
    id: 'MASTERS_1000_48_56',
    name: 'Masters 1000 (48/56)',
    description: 'Masters 1000 com chave de 48 ou 56 jogadores',
    rounds: [null, 0, 50, 100, 200, 400, 650, 1000],
    runnerUp: 0,
  },
  {
    id: 'ATP_500_48',
    name: 'ATP 500 (48)',
    description: 'ATP 500 com chave de 48 jogadores',
    rounds: [null, 0, 25, 50, 100, 200, 330, 500],
    runnerUp: 0,
  },
  {
    id: 'ATP_500_32',
    name: 'ATP 500 (32)',
    description: 'ATP 500 com chave de 32 jogadores',
    rounds: [null, null, 0, 50, 100, 200, 330, 500],
    runnerUp: 0,
  },
  {
    id: 'ATP_250_48',
    name: 'ATP 250 (48)',
    description: 'ATP 250 com chave de 48 jogadores',
    rounds: [null, 0, 13, 25, 50, 100, 165, 250],
    runnerUp: 0,
  },
  {
    id: 'ATP_250_32',
    name: 'ATP 250 (32)',
    description: 'ATP 250 com chave de 32 jogadores',
    rounds: [null, null, 0, 25, 50, 100, 165, 250],
    runnerUp: 0,
  },
];

export function getPointsConfig(category: string, size: number): PointsConfig {
  if (category === 'MASTERS_1000') {
    const variant =
      size >= 96
        ? POINTS_VARIANTS.find((c) => c.id === 'MASTERS_1000_96')
        : POINTS_VARIANTS.find((c) => c.id === 'MASTERS_1000_48_56');
    return variant || POINTS_CONFIG.MASTERS_1000;
  }

  if (category === 'ATP_500') {
    const variant =
      size === 32
        ? POINTS_VARIANTS.find((c) => c.id === 'ATP_500_32')
        : POINTS_VARIANTS.find((c) => c.id === 'ATP_500_48');
    return variant || POINTS_CONFIG.ATP_500;
  }

  if (category === 'ATP_250') {
    const variant =
      size === 32
        ? POINTS_VARIANTS.find((c) => c.id === 'ATP_250_32')
        : POINTS_VARIANTS.find((c) => c.id === 'ATP_250_48');
    return variant || POINTS_CONFIG.ATP_250;
  }

  return POINTS_CONFIG[category] || POINTS_CONFIG.GRAND_SLAM;
}

export function getMatchPoints(category: string, round: number, totalRounds: number, size: number): number {
  const config = getPointsConfig(category, size);
  const offset = config.rounds.length - totalRounds;
  const index = offset + (round - 1);
  return config.rounds[index] ?? 0;
}

// ==================== TOURNAMENTS ====================

async function syncTournamentStatuses(): Promise<void> {
  // Update to IN_PROGRESS if started (Brasilia time offset -3h)
  await sql`
    UPDATE tournaments
    SET status = 'IN_PROGRESS', updated_at = NOW()
    WHERE status IN ('active', 'published', 'upcoming', 'OPEN', 'UPCOMING')
      AND start_date <= (NOW() - INTERVAL '3 hours')
  `;

  // Update back to OPEN if moved to future and no matches completed
  await sql`
    UPDATE tournaments
    SET status = 'OPEN', updated_at = NOW()
    WHERE status = 'IN_PROGRESS'
      AND start_date > (NOW() - INTERVAL '3 hours')
      AND NOT EXISTS (
        SELECT 1 FROM bracket_matches 
        WHERE tournament_id = tournaments.id 
          AND status = 'completed'
          AND score != 'BYE'
      )
  `;
}

export async function getTournamentsActive(): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments 
    WHERE is_visible = TRUE 
    AND status IN ('active', 'published', 'upcoming', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS', 'STANDBY') 
    ORDER BY start_date ASC
  `;
  return rows as Tournament[];
}

export async function getTournamentsActiveThisMonth(): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments
    WHERE is_visible = TRUE
      AND status IN ('active', 'published', 'upcoming', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS')
      AND start_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND start_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')
    ORDER BY start_date ASC
  `;
  return rows as Tournament[];
}

export async function getTournamentsByYear(year: number): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments
    WHERE is_visible = TRUE
      AND EXTRACT(YEAR FROM start_date) = ${year}
      AND (
        status NOT IN ('finished', 'FINISHED', 'completed')
        OR EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id)
      )
    ORDER BY start_date DESC
  `;
  return rows as Tournament[];
}

export async function getTournaments(): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments 
    ORDER BY start_date ASC
  `;
  return rows as Tournament[];
}

export async function getTournamentsWithBrackets(): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments 
    WHERE is_visible = TRUE 
      AND EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id)
    ORDER BY start_date DESC
  `;
  return rows as Tournament[];
}

export async function getTournamentsByYearAndMonth(year: number, month: number): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments 
    WHERE is_visible = TRUE
    AND EXTRACT(YEAR FROM start_date) = ${year}
    AND EXTRACT(MONTH FROM start_date) = ${month}
    AND (
      status NOT IN ('finished', 'FINISHED', 'completed')
      OR EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id)
    )
    ORDER BY start_date ASC
  `;
  return rows as Tournament[];
}

export async function getAllVisibleTournaments(limit?: number): Promise<Tournament[]> {
  await syncTournamentStatuses();

  if (limit) {
    const rows = await sql`
      SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
      FROM tournaments
      WHERE is_visible = TRUE
      AND (
        status NOT IN ('finished', 'FINISHED', 'completed')
      )
      ORDER BY start_date ASC, id ASC
      LIMIT ${limit}
    `;
    return rows as Tournament[];
  }

  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments
    WHERE is_visible = TRUE
    AND (
      status NOT IN ('finished', 'FINISHED', 'completed')
    )
    ORDER BY start_date ASC, id ASC
  `;

  return rows as Tournament[];
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  // Auto-update status if started (Brasilia time offset -3h)
  await sql`
    UPDATE tournaments
    SET status = 'IN_PROGRESS', updated_at = NOW()
    WHERE id = ${id}
      AND status IN ('active', 'published', 'upcoming', 'OPEN', 'UPCOMING')
      AND start_date <= (NOW() - INTERVAL '3 hours')
  `;

  // Auto-update back to OPEN if moved to future and no matches completed
  await sql`
    UPDATE tournaments
    SET status = 'OPEN', updated_at = NOW()
    WHERE id = ${id}
      AND status = 'IN_PROGRESS'
      AND start_date > (NOW() - INTERVAL '3 hours')
      AND NOT EXISTS (
        SELECT 1 FROM bracket_matches 
        WHERE tournament_id = ${id}
          AND status = 'completed'
          AND score != 'BYE'
      )
  `;

  const rows =
    await sql`SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id FROM tournaments WHERE id = ${id}`;
  return rows.length > 0 ? (rows[0] as Tournament) : null;
}

export async function getActiveTournament(): Promise<Tournament | null> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments
    WHERE is_visible = TRUE
      AND status IN ('OPEN', 'LOCKED', 'IN_PROGRESS')
      AND start_date <= (NOW() - INTERVAL '3 hours')
    ORDER BY start_date DESC
    LIMIT 1
  `;
  return rows.length > 0 ? (rows[0] as Tournament) : null;
}

// ==================== PLAYERS ====================

export async function getPlayers(): Promise<Player[]> {
  const rows = await sql`SELECT * FROM players ORDER BY name ASC`;
  return rows as Player[];
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const rows = await sql`SELECT * FROM players WHERE id = ${id}`;
  return rows.length > 0 ? (rows[0] as Player) : null;
}

export async function getUserPublicInfo(userId: number): Promise<{ id: number; name: string } | null> {
  const rows = await sql`
    SELECT id, COALESCE(NULLIF(nickname, ''), name) as name
    FROM users
    WHERE id = ${userId} AND (is_deleted IS FALSE OR is_deleted IS NULL)
  `;
  return rows.length > 0 ? (rows[0] as { id: number; name: string }) : null;
}

export async function getTournamentNames(): Promise<TournamentMetadata[]> {
  const rows = await sql`SELECT * FROM tournament_names ORDER BY name ASC`;
  return rows as TournamentMetadata[];
}

export async function getTournamentLocations(): Promise<TournamentMetadata[]> {
  const rows = await sql`SELECT * FROM tournament_locations ORDER BY name ASC`;
  return rows as TournamentMetadata[];
}

// ==================== BRACKET MATCHES ====================

export async function getBracketMatches(tournamentId: number): Promise<BracketMatch[]> {
  const rows = await sql`
    SELECT 
      bm.*,
      p1.name as player1_name, p1.display_name as player1_display_name, p1.country as player1_country, p1.seed as player1_seed_val,
      p2.name as player2_name, p2.display_name as player2_display_name, p2.country as player2_country, p2.seed as player2_seed_val,
      w.name as winner_name, w.display_name as winner_display_name
    FROM bracket_matches bm
    LEFT JOIN players p1 ON bm.player1_id = p1.id
    LEFT JOIN players p2 ON bm.player2_id = p2.id
    LEFT JOIN players w ON bm.winner_id = w.id
    WHERE bm.tournament_id = ${tournamentId}
    ORDER BY bm.round ASC, bm.position ASC
  `;
  return rows as BracketMatch[];
}

export async function getBracketMatchesByRound(tournamentId: number, round: number): Promise<BracketMatch[]> {
  const rows = await sql`
    SELECT 
      bm.*,
      p1.name as player1_name, p1.display_name as player1_display_name, p1.country as player1_country, p1.seed as player1_seed_val,
      p2.name as player2_name, p2.display_name as player2_display_name, p2.country as player2_country, p2.seed as player2_seed_val,
      w.name as winner_name, w.display_name as winner_display_name
    FROM bracket_matches bm
    LEFT JOIN players p1 ON bm.player1_id = p1.id
    LEFT JOIN players p2 ON bm.player2_id = p2.id
    LEFT JOIN players w ON bm.winner_id = w.id
    WHERE bm.tournament_id = ${tournamentId} AND bm.round = ${round}
    ORDER BY bm.position ASC
  `;
  return rows as BracketMatch[];
}

// ==================== PREDICTIONS ====================

export async function createPrediction(
  userId: number,
  bracketMatchId: number,
  predictedWinnerId: number,
): Promise<void> {
  await sql`
    INSERT INTO predictions (user_id, bracket_match_id, predicted_winner_id)
    VALUES (${userId}, ${bracketMatchId}, ${predictedWinnerId})
    ON CONFLICT (user_id, bracket_match_id) 
    DO UPDATE SET predicted_winner_id = ${predictedWinnerId}
  `;
}

export async function getUserPredictions(userId: number, tournamentId: number): Promise<Prediction[]> {
  const rows = await sql`
    SELECT p.* FROM predictions p
    JOIN bracket_matches bm ON p.bracket_match_id = bm.id
    WHERE p.user_id = ${userId} AND bm.tournament_id = ${tournamentId}
  `;
  return rows as Prediction[];
}

export async function getUserPredictionsWithDetails(userId: number): Promise<PredictionWithDetails[]> {
  const rows = await sql`
    SELECT 
      p.id, p.bracket_match_id, p.predicted_winner_id, p.predicted_score, p.is_correct, p.points_earned, p.created_at,
      pw.name as predicted_winner_name,
      p1.name as player1_name, p2.name as player2_name,
      bm.player1_type, bm.player2_type, bm.player1_seed, bm.player2_seed,
      bm.round, bm.match_date, bm.score, bm.status as match_status,
      w.name as winner_name,
      t.id as tournament_id, t.name as tournament_name, t.size as tournament_size
    FROM predictions p
    JOIN bracket_matches bm ON p.bracket_match_id = bm.id
    LEFT JOIN players p1 ON bm.player1_id = p1.id
    LEFT JOIN players p2 ON bm.player2_id = p2.id
    LEFT JOIN players w ON bm.winner_id = w.id
    LEFT JOIN players pw ON p.predicted_winner_id = pw.id
    JOIN tournaments t ON bm.tournament_id = t.id
    WHERE p.user_id = ${userId}
    ORDER BY p.created_at DESC
  `;
  return rows as PredictionWithDetails[];
}

// ==================== STATS & RANKING ====================

export async function getUserStats(userId: number): Promise<UserStats> {
  // Stats show only tournaments currently in progress (not finished ones)
  const tournaments = await sql`
    SELECT id, name, start_date
    FROM tournaments
    WHERE EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id AND bm.status = 'completed')
      AND status IN ('IN_PROGRESS', 'LOCKED')
    ORDER BY start_date DESC
  `;

  const tournamentIds = tournaments.map((t) => t.id as number);

  // If no in-progress tournaments, return empty stats
  if (tournamentIds.length === 0) {
    const activeTournaments = await sql`
      SELECT COUNT(DISTINCT ut.tournament_id) as count
      FROM user_tournaments ut
      JOIN tournaments t ON ut.tournament_id = t.id
      WHERE 
        ut.user_id = ${userId} 
        AND t.status IN ('upcoming', 'active', 'published', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS')
    `;
    return {
      total_points: 0,
      correct_predictions: 0,
      wrong_predictions: 0,
      total_predictions: 0,
      accuracy: 0,
      active_tournaments: Number(activeTournaments[0]?.count || 0),
      tournament_stats: [],
    };
  }

  // Get per-tournament breakdown for this user (only in-progress tournaments)
  const tournamentBreakdown = await sql`
    SELECT 
      t.id as tournament_id,
      t.name as tournament_name,
      COALESCE(SUM(p.points_earned), 0) as points,
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(CASE WHEN p.is_correct = false THEN 1 END) as wrong_predictions,
      COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END) as total_predictions
    FROM predictions p
    JOIN bracket_matches m ON m.id = p.bracket_match_id
    JOIN tournaments t ON t.id = m.tournament_id
    WHERE 
      p.user_id = ${userId}
      AND m.status = 'completed'
      AND m.tournament_id = ANY(${tournamentIds}::integer[])
      AND m.points_cancelled IS NOT TRUE
    GROUP BY t.id, t.name
    HAVING COUNT(p.id) > 0
    ORDER BY points DESC
  `;

  const allTournamentStats = tournamentBreakdown.map((tb) => {
    const tbCorrect = Number(tb.correct_predictions || 0);
    const tbWrong = Number(tb.wrong_predictions || 0);
    const tbResolved = tbCorrect + tbWrong;
    return {
      tournament_id: Number(tb.tournament_id),
      tournament_name: String(tb.tournament_name),
      points: Number(tb.points || 0),
      correct_predictions: tbCorrect,
      wrong_predictions: tbWrong,
      total_predictions: Number(tb.total_predictions || 0),
      accuracy: tbResolved > 0 ? Math.round((tbCorrect / tbResolved) * 100) : 0,
    };
  });

  const totalPoints = allTournamentStats.reduce((sum, t) => sum + t.points, 0);
  const correct = allTournamentStats.reduce((sum, t) => sum + t.correct_predictions, 0);
  const wrong = allTournamentStats.reduce((sum, t) => sum + t.wrong_predictions, 0);
  const total = allTournamentStats.reduce((sum, t) => sum + t.total_predictions, 0);
  const resolved = correct + wrong;

  const activeTournaments = await sql`
    SELECT COUNT(DISTINCT ut.tournament_id) as count
    FROM user_tournaments ut
    JOIN tournaments t ON ut.tournament_id = t.id
    WHERE 
      ut.user_id = ${userId} 
      AND t.status IN ('upcoming', 'active', 'published', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS')
  `;

  return {
    total_points: totalPoints,
    correct_predictions: correct,
    wrong_predictions: wrong,
    total_predictions: total,
    accuracy: resolved > 0 ? Math.round((correct / resolved) * 100) : 0,
    active_tournaments: Number(activeTournaments[0]?.count || 0),
    tournament_stats: allTournamentStats.map((ts) => ({
      tournament_id: ts.tournament_id,
      tournament_name: ts.tournament_name,
      points: ts.points,
      correct_predictions: ts.correct_predictions,
      total_predictions: ts.total_predictions,
      accuracy: ts.accuracy,
    })),
  };
}

export async function getGlobalRanking(limit: number = 50, tournamentId?: number | null): Promise<RankingEntry[]> {
  // When filtering by a specific tournament, use simple sum (no defense logic needed)
  if (tournamentId) {
    const ranking = await sql`
      SELECT *
      FROM (
        SELECT 
          u.id as user_id,
          COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
          (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct = true AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as correct_predictions,
          (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct IS NOT NULL AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as total_predictions,
          COALESCE((SELECT SUM(p.points_earned) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}), 0) as total_points,
          (SELECT MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id) THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_champion,
          (SELECT MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_both,
          COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as global_points
        FROM users u
        WHERE u.is_admin = false AND u.is_deleted = false
        AND EXISTS (
          SELECT 1 FROM predictions p_final
          JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
          WHERE p_final.user_id = u.id 
          AND bm_final.tournament_id = ${tournamentId}
          AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
        )
      ) r
      WHERE r.total_points > 0
      ORDER BY r.total_points DESC, r.hit_champion DESC, r.hit_both DESC, r.correct_predictions DESC, r.global_points DESC, r.user_name ASC
      LIMIT ${limit}`;
    return ranking.map((r, i) => ({
      user_id: r.user_id as number,
      user_name: r.user_name as string,
      correct_predictions: Number(r.correct_predictions || 0),
      total_predictions: Number(r.total_predictions || 0),
      total_points: Number(r.total_points || 0),
      hit_champion: Boolean(r.hit_champion),
      hit_both: Boolean(r.hit_both),
      global_points: Number(r.global_points || 0),
      rank: i + 1,
    }));
  }

  // Global ranking with:
  // 1. Point defense: only the most recent edition of each recurring tournament counts
  // 2. 52-week validity: only tournaments from the last 52 weeks count
  // 3. Best 22 of 29: only the top 22 tournament scores per user count

  const MAX_COUNTING_TOURNAMENTS = 22;

  // Step 1: Get all tournaments with completed matches within the last 52 weeks (only finished tournaments)
  const tournaments = await sql`
    SELECT id, name, start_date
    FROM tournaments
    WHERE EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id AND bm.status = 'completed')
      AND start_date >= (NOW() - INTERVAL '52 weeks')
      AND status IN ('FINISHED', 'finished', 'completed')
    ORDER BY start_date DESC
  `;

  // Step 2: Determine which tournament ID is the "active" one for each tournament name
  const latestByName: Record<string, number> = {};

  for (const t of tournaments) {
    const name = (t.name as string).trim();
    if (!latestByName[name]) {
      latestByName[name] = t.id as number;
    }
  }

  const activeIds = Object.values(latestByName);

  if (activeIds.length === 0) {
    return [];
  }

  // Step 3: Get per-user, per-tournament points for all valid tournaments
  const perTournamentPoints = await sql`
    SELECT 
      p.user_id,
      bm.tournament_id,
      COALESCE(SUM(p.points_earned), 0) as tournament_points,
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END) as total_predictions,
      MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id) THEN 1 ELSE 0 END) as hit_champion,
      MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) as hit_both
    FROM predictions p
    JOIN bracket_matches bm ON p.bracket_match_id = bm.id
    JOIN users u ON u.id = p.user_id
    WHERE bm.status = 'completed'
      AND bm.points_cancelled IS NOT TRUE
      AND bm.tournament_id = ANY(${activeIds}::integer[])
      AND u.is_admin = false
      AND u.is_deleted = false
      AND EXISTS (
        SELECT 1 FROM predictions p_final
        JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
        WHERE p_final.user_id = p.user_id 
        AND bm_final.tournament_id = bm.tournament_id
        AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id)
      )
    GROUP BY p.user_id, bm.tournament_id
  `;

  // Step 4: Get user names
  const userNames = await sql`
    SELECT id, COALESCE(NULLIF(nickname, ''), name) as user_name
    FROM users
    WHERE is_admin = false AND is_deleted = false
  `;
  const userNameMap: Record<number, string> = {};
  for (const u of userNames) {
    userNameMap[u.id as number] = u.user_name as string;
  }

  // Step 5: Group by user and apply "best 22" rule
  const userTournaments: Record<number, Array<{
    tournament_id: number;
    points: number;
    correct: number;
    total: number;
    hit_champion: boolean;
    hit_both: boolean;
  }>> = {};

  for (const row of perTournamentPoints) {
    const userId = row.user_id as number;
    if (!userTournaments[userId]) {
      userTournaments[userId] = [];
    }
    userTournaments[userId].push({
      tournament_id: row.tournament_id as number,
      points: Number(row.tournament_points || 0),
      correct: Number(row.correct_predictions || 0),
      total: Number(row.total_predictions || 0),
      hit_champion: Boolean(Number(row.hit_champion)),
      hit_both: Boolean(Number(row.hit_both)),
    });
  }

  // Step 6: For each user, sort tournaments by points DESC and take only the top 22
  const rankingEntries: RankingEntry[] = [];

  for (const [userIdStr, tournamentScores] of Object.entries(userTournaments)) {
    const userId = Number(userIdStr);
    const userName = userNameMap[userId];
    if (!userName) continue;

    // Sort by points descending and take top 22
    const sorted = tournamentScores.sort((a, b) => b.points - a.points);
    const top = sorted.slice(0, MAX_COUNTING_TOURNAMENTS);

    const totalPoints = top.reduce((sum, t) => sum + t.points, 0);
    if (totalPoints <= 0) continue;

    const correctPredictions = top.reduce((sum, t) => sum + t.correct, 0);
    const totalPredictions = top.reduce((sum, t) => sum + t.total, 0);
    const hitChampion = top.some((t) => t.hit_champion);
    const hitBoth = top.some((t) => t.hit_both);

    rankingEntries.push({
      user_id: userId,
      user_name: userName,
      correct_predictions: correctPredictions,
      total_predictions: totalPredictions,
      total_points: totalPoints,
      hit_champion: hitChampion,
      hit_both: hitBoth,
      global_points: totalPoints,
      rank: 0,
    });
  }

  // Step 7: Sort by ranking criteria and assign ranks
  rankingEntries.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (Number(b.hit_champion) !== Number(a.hit_champion)) return Number(b.hit_champion) - Number(a.hit_champion);
    if (Number(b.hit_both) !== Number(a.hit_both)) return Number(b.hit_both) - Number(a.hit_both);
    if (b.correct_predictions !== a.correct_predictions) return b.correct_predictions - a.correct_predictions;
    if ((b.global_points || 0) !== (a.global_points || 0)) return (b.global_points || 0) - (a.global_points || 0);
    return a.user_name.localeCompare(b.user_name);
  });

  return rankingEntries.slice(0, limit).map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));
}

export async function getStateRanking(
  state: string,
  tournamentId?: number | null,
  limit: number = 100,
): Promise<RankingEntry[]> {
  // When filtering by a specific tournament, use simple sum (no defense logic needed)
  if (tournamentId) {
    const ranking = await sql`
      SELECT *
      FROM (
        SELECT 
          u.id as user_id,
          COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
          (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct = true AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as correct_predictions,
          (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct IS NOT NULL AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as total_predictions,
          COALESCE((SELECT SUM(p.points_earned) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}), 0) as total_points,
          (SELECT MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id) THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_champion,
          (SELECT MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_both,
          COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as global_points
        FROM users u
        WHERE u.state = ${state} AND u.is_admin = false AND u.is_deleted = false
        AND EXISTS (
          SELECT 1 FROM predictions p_final
          JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
          WHERE p_final.user_id = u.id 
          AND bm_final.tournament_id = ${tournamentId}
          AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
        )
      ) r
      ORDER BY r.total_points DESC, r.hit_champion DESC, r.hit_both DESC, r.correct_predictions DESC, r.global_points DESC, r.user_name ASC
      LIMIT ${limit}`;

    return ranking.map((r, i) => ({
      user_id: r.user_id as number,
      user_name: r.user_name as string,
      correct_predictions: Number(r.correct_predictions || 0),
      total_predictions: Number(r.total_predictions || 0),
      total_points: Number(r.total_points || 0),
      hit_champion: Boolean(r.hit_champion),
      hit_both: Boolean(r.hit_both),
      global_points: Number(r.global_points || 0),
      rank: i + 1,
    }));
  }

  // Global state ranking with point defense logic + 52-week validity + best 22 rule (only finished tournaments)
  const MAX_COUNTING_TOURNAMENTS = 22;

  const tournaments = await sql`
    SELECT id, name, start_date
    FROM tournaments
    WHERE EXISTS (SELECT 1 FROM bracket_matches bm WHERE bm.tournament_id = tournaments.id AND bm.status = 'completed')
      AND start_date >= (NOW() - INTERVAL '52 weeks')
      AND status IN ('FINISHED', 'finished', 'completed')
    ORDER BY start_date DESC
  `;

  const latestByName: Record<string, number> = {};
  for (const t of tournaments) {
    const name = (t.name as string).trim();
    if (!latestByName[name]) {
      latestByName[name] = t.id as number;
    }
  }

  const activeIds = Object.values(latestByName);

  if (activeIds.length === 0) {
    return [];
  }

  // Get per-user, per-tournament points for users in this state
  const perTournamentPoints = await sql`
    SELECT 
      p.user_id,
      bm.tournament_id,
      COALESCE(SUM(p.points_earned), 0) as tournament_points,
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END) as total_predictions,
      MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id) THEN 1 ELSE 0 END) as hit_champion,
      MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) as hit_both
    FROM predictions p
    JOIN bracket_matches bm ON p.bracket_match_id = bm.id
    JOIN users u ON u.id = p.user_id
    WHERE bm.status = 'completed'
      AND bm.points_cancelled IS NOT TRUE
      AND bm.tournament_id = ANY(${activeIds}::integer[])
      AND u.state = ${state}
      AND u.is_admin = false
      AND u.is_deleted = false
      AND EXISTS (
        SELECT 1 FROM predictions p_final
        JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
        WHERE p_final.user_id = p.user_id 
        AND bm_final.tournament_id = bm.tournament_id
        AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id)
      )
    GROUP BY p.user_id, bm.tournament_id
  `;

  // Get user names for this state
  const userNames = await sql`
    SELECT id, COALESCE(NULLIF(nickname, ''), name) as user_name
    FROM users
    WHERE state = ${state} AND is_admin = false AND is_deleted = false
  `;
  const userNameMap: Record<number, string> = {};
  for (const u of userNames) {
    userNameMap[u.id as number] = u.user_name as string;
  }

  // Group by user and apply "best 22" rule
  const userTournaments: Record<number, Array<{
    tournament_id: number;
    points: number;
    correct: number;
    total: number;
    hit_champion: boolean;
    hit_both: boolean;
  }>> = {};

  for (const row of perTournamentPoints) {
    const userId = row.user_id as number;
    if (!userTournaments[userId]) {
      userTournaments[userId] = [];
    }
    userTournaments[userId].push({
      tournament_id: row.tournament_id as number,
      points: Number(row.tournament_points || 0),
      correct: Number(row.correct_predictions || 0),
      total: Number(row.total_predictions || 0),
      hit_champion: Boolean(Number(row.hit_champion)),
      hit_both: Boolean(Number(row.hit_both)),
    });
  }

  const rankingEntries: RankingEntry[] = [];

  for (const [userIdStr, tournamentScores] of Object.entries(userTournaments)) {
    const userId = Number(userIdStr);
    const userName = userNameMap[userId];
    if (!userName) continue;

    const sorted = tournamentScores.sort((a, b) => b.points - a.points);
    const top = sorted.slice(0, MAX_COUNTING_TOURNAMENTS);

    const totalPoints = top.reduce((sum, t) => sum + t.points, 0);
    if (totalPoints <= 0) continue;

    const correctPredictions = top.reduce((sum, t) => sum + t.correct, 0);
    const totalPredictions = top.reduce((sum, t) => sum + t.total, 0);
    const hitChampion = top.some((t) => t.hit_champion);
    const hitBoth = top.some((t) => t.hit_both);

    rankingEntries.push({
      user_id: userId,
      user_name: userName,
      correct_predictions: correctPredictions,
      total_predictions: totalPredictions,
      total_points: totalPoints,
      hit_champion: hitChampion,
      hit_both: hitBoth,
      global_points: totalPoints,
      rank: 0,
    });
  }

  rankingEntries.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (Number(b.hit_champion) !== Number(a.hit_champion)) return Number(b.hit_champion) - Number(a.hit_champion);
    if (Number(b.hit_both) !== Number(a.hit_both)) return Number(b.hit_both) - Number(a.hit_both);
    if (b.correct_predictions !== a.correct_predictions) return b.correct_predictions - a.correct_predictions;
    if ((b.global_points || 0) !== (a.global_points || 0)) return (b.global_points || 0) - (a.global_points || 0);
    return a.user_name.localeCompare(b.user_name);
  });

  return rankingEntries.slice(0, limit).map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));
}

export async function getStateMemberCount(state: string): Promise<number> {
  const rows =
    await sql`SELECT COUNT(*) as count FROM users WHERE state = ${state} AND is_admin = false AND is_deleted = false`;
  return Number(rows[0]?.count || 0);
}

export async function getTournamentRanking(
  tournamentId: number,
  limit: number = 100,
  state?: string | null,
): Promise<RankingEntry[]> {
  const ranking = await sql`
    WITH tournament_stats AS (
      SELECT
        u.id as user_id,
        COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct = true AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.score != 'BYE' AND bm.tournament_id = ${tournamentId}) as correct_predictions,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct IS NOT NULL AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.score != 'BYE' AND bm.tournament_id = ${tournamentId}) as total_predictions,
        COALESCE((SELECT SUM(p.points_earned) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}), 0) as total_points,
        (SELECT MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId}) THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_champion,
        (SELECT MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND bm.tournament_id = ${tournamentId}) as hit_both,
        COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as global_points
      FROM users u
      JOIN user_tournaments ut 
        ON u.id = ut.user_id
      WHERE 
        ut.tournament_id = ${tournamentId} 
        AND u.is_admin = false 
        AND u.is_deleted = false
        AND (${state || null}::text IS NULL OR u.state = ${state || null})
        AND EXISTS (
          SELECT 1 FROM predictions p_final
          JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
          WHERE p_final.user_id = u.id 
          AND bm_final.tournament_id = ${tournamentId}
          AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
        )
      GROUP BY u.id, u.name, u.nickname
    )
    SELECT * FROM tournament_stats
    WHERE total_predictions > 0
    ORDER BY total_points DESC, hit_champion DESC, hit_both DESC, correct_predictions DESC, global_points DESC, user_name ASC
    LIMIT ${limit}
  `;

  return ranking.map((r, i) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: Number(r.correct_predictions || 0),
    total_predictions: Number(r.total_predictions || 0),
    total_points: Number(r.total_points || 0),
    hit_champion: Boolean(r.hit_champion),
    hit_both: Boolean(r.hit_both),
    global_points: Number(r.global_points || 0),
    rank: i + 1,
  }));
}

export async function getUserRanking(userId: number): Promise<RankingEntry | null> {
  const ranking = await getGlobalRanking(1000);
  return ranking.find((r) => r.user_id === userId) || null;
}

// ==================== ENROLLMENT ====================

export interface Enrollment {
  id: number;
  user_id: number;
  tournament_id: number;
  bracket_submitted: boolean;
}

// ==================== POOLS ====================

export interface Pool {
  id: number | string;
  name: string;
  description: string | null;
  creator_id: number | null;
  is_general: boolean;
  password_hash: string | null;
  created_at: string;
  tournament_id?: number | null;
  member_count?: number;
  is_member?: boolean;
  is_state_pool?: boolean;
  hide_pending?: boolean;
  whatsapp_link?: string | null;
}

export interface PoolMember {
  pool_id: number;
  user_id: number;
  joined_at: string;
}

export async function getPools(search?: string): Promise<Pool[]> {
  let query;
  if (search) {
    const searchPattern = `%${search}%`;
    query = sql`
      SELECT p.*, COUNT(pm.user_id)::int as member_count
      FROM pools p
      LEFT JOIN pool_members pm ON p.id = pm.pool_id
      WHERE p.is_general = FALSE AND p.name ILIKE ${searchPattern}
      GROUP BY p.id
      ORDER BY p.name ASC
    `;
  } else {
    query = sql`
      SELECT p.*, COUNT(pm.user_id)::int as member_count
      FROM pools p
      LEFT JOIN pool_members pm ON p.id = pm.pool_id
      WHERE p.is_general = FALSE
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
  }
  const rows = await query;
  return rows as Pool[];
}

export async function getGeneralPools(): Promise<Pool[]> {
  const rows = await sql`
    SELECT p.*, COUNT(pm.user_id)::int as member_count
    FROM pools p
    LEFT JOIN pool_members pm ON p.id = pm.pool_id
    WHERE p.is_general = TRUE
    GROUP BY p.id
    ORDER BY p.name ASC
  `;
  return rows as Pool[];
}

export async function getUserPools(userId: number): Promise<Pool[]> {
  const rows = await sql`
    SELECT p.*, COUNT(pm2.user_id)::int as member_count
    FROM pools p
    JOIN pool_members pm ON p.id = pm.pool_id
    LEFT JOIN pool_members pm2 ON p.id = pm2.pool_id
    WHERE pm.user_id = ${userId}
    GROUP BY p.id
    ORDER BY p.is_general DESC, p.name ASC
  `;
  return rows as Pool[];
}

export async function getPoolById(id: number): Promise<Pool | null> {
  const rows = await sql`
    SELECT p.*, COUNT(pm.user_id)::int as member_count
    FROM pools p
    LEFT JOIN pool_members pm ON p.id = pm.pool_id
    WHERE p.id = ${id}
    GROUP BY p.id
  `;
  return rows.length > 0 ? (rows[0] as Pool) : null;
}

export async function isUserPoolMember(userId: number, poolId: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM pool_members WHERE user_id = ${userId} AND pool_id = ${poolId}
  `;
  return rows.length > 0;
}

export async function getPoolRanking(
  poolId: number,
  tournamentIdOverride?: number | null,
  limit: number = 100,
): Promise<RankingEntry[]> {
  const pool = await getPoolById(poolId);
  const tournamentId = tournamentIdOverride !== undefined ? tournamentIdOverride : pool?.tournament_id || null;

  // Get ranked members (those who completed predictions for the final round)
  const ranking = await sql`
    SELECT *
    FROM (
      SELECT 
        u.id as user_id,
        COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct = true AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND (${tournamentId}::integer IS NULL OR bm.tournament_id = ${tournamentId})) as correct_predictions,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct IS NOT NULL AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND (${tournamentId}::integer IS NULL OR bm.tournament_id = ${tournamentId})) as total_predictions,
        COALESCE((SELECT SUM(p.points_earned) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND (${tournamentId}::integer IS NULL OR bm.tournament_id = ${tournamentId})), 0) as total_points,
        (SELECT MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm.tournament_id) THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND (${tournamentId}::integer IS NULL OR bm.tournament_id = ${tournamentId})) as hit_champion,
        (SELECT MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.status = 'completed' AND bm.points_cancelled IS NOT TRUE AND (${tournamentId}::integer IS NULL OR bm.tournament_id = ${tournamentId})) as hit_both,
        COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as global_points
      FROM users u
      JOIN pool_members pm ON u.id = pm.user_id
      WHERE pm.pool_id = ${poolId} AND u.is_admin = false AND u.is_deleted = false
      AND (
        (${tournamentId}::integer IS NOT NULL AND EXISTS (
          SELECT 1 FROM predictions p_final
          JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
          WHERE p_final.user_id = u.id 
          AND bm_final.tournament_id = ${tournamentId}
          AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
        ))
        OR
        (${tournamentId}::integer IS NULL AND EXISTS (
          SELECT 1 FROM predictions p_final
          JOIN bracket_matches bm_final ON p_final.bracket_match_id = bm_final.id
          WHERE p_final.user_id = u.id 
          AND bm_final.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = bm_final.tournament_id)
        ))
      )
    ) r
    ORDER BY r.total_points DESC, r.hit_champion DESC, r.hit_both DESC, r.correct_predictions DESC, r.global_points DESC, r.user_name ASC
    LIMIT ${limit}`;

  const rankedEntries: RankingEntry[] = ranking.map((r, i) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: Number(r.correct_predictions || 0),
    total_predictions: Number(r.total_predictions || 0),
    total_points: Number(r.total_points || 0),
    hit_champion: Boolean(r.hit_champion),
    hit_both: Boolean(r.hit_both),
    global_points: Number(r.global_points || 0),
    rank: i + 1,
    has_predictions: true,
  }));

  // Get members who did NOT complete predictions (not in the ranked list)
  const rankedUserIds = rankedEntries.map(e => e.user_id);
  const unrankedMembers = await sql`
    SELECT 
      u.id as user_id,
      COALESCE(NULLIF(u.nickname, ''), u.name) as user_name
    FROM users u
    JOIN pool_members pm ON u.id = pm.user_id
    WHERE pm.pool_id = ${poolId} 
      AND u.is_admin = false 
      AND u.is_deleted = false
      AND u.id != ALL(${rankedUserIds.length > 0 ? rankedUserIds : [0]}::integer[])
  `;

  const unrankedEntries: RankingEntry[] = unrankedMembers.map((r) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: 0,
    total_predictions: 0,
    total_points: 0,
    hit_champion: false,
    hit_both: false,
    global_points: 0,
    rank: null,
    has_predictions: false,
  }));

  // Sort unranked alphabetically
  unrankedEntries.sort((a, b) => a.user_name.localeCompare(b.user_name));

  return [...rankedEntries, ...unrankedEntries];
}

export async function getEnrollment(userId: number, tournamentId: number): Promise<Enrollment | null> {
  const rows = await sql`
    SELECT * FROM user_tournaments
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `;
  return rows.length > 0 ? (rows[0] as Enrollment) : null;
}

export async function isUserEnrolled(userId: number, tournamentId: number): Promise<boolean> {
  const enrollment = await getEnrollment(userId, tournamentId);
  return !!enrollment;
}

export async function enrollUser(userId: number, tournamentId: number): Promise<void> {
  await sql`
    INSERT INTO user_tournaments (user_id, tournament_id)
    VALUES (${userId}, ${tournamentId})
    ON CONFLICT (user_id, tournament_id) DO NOTHING
  `;
}

export async function getTournamentParticipantCount(tournamentId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM user_tournaments WHERE tournament_id = ${tournamentId}
  `;
  return Number(result[0]?.count || 0);
}

export async function getTournamentPlayers(tournamentId: number, includePredictedByUserId?: number): Promise<Player[]> {
  if (includePredictedByUserId) {
    // Include players that were predicted by the user but may no longer be in the bracket (e.g. replaced by LL)
    const players = await sql`
      SELECT DISTINCT p.id, p.name, p.display_name, p.country, p.seed
      FROM players p
      WHERE p.id IN (
        SELECT bm.player1_id FROM bracket_matches bm WHERE bm.tournament_id = ${tournamentId} AND bm.player1_id IS NOT NULL
        UNION
        SELECT bm.player2_id FROM bracket_matches bm WHERE bm.tournament_id = ${tournamentId} AND bm.player2_id IS NOT NULL
        UNION
        SELECT pred.predicted_winner_id FROM predictions pred
        JOIN bracket_matches bm2 ON pred.bracket_match_id = bm2.id
        WHERE bm2.tournament_id = ${tournamentId} AND pred.user_id = ${includePredictedByUserId}
      )
      ORDER BY p.name ASC
    `;
    return players as Player[];
  }

  const players = await sql`
    SELECT DISTINCT p.id, p.name, p.display_name, p.country, p.seed
    FROM players p
    JOIN bracket_matches bm ON (p.id = bm.player1_id OR p.id = bm.player2_id)
    WHERE bm.tournament_id = ${tournamentId}
    ORDER BY p.name ASC
  `;
  return players as Player[];
}

export async function hasTournamentStarted(tournamentId: number): Promise<boolean> {
  const tournament = await getTournamentById(tournamentId);

  if (
    tournament &&
    (tournament.status === 'IN_PROGRESS' ||
      tournament.status === 'LOCKED' ||
      tournament.status === 'finished' ||
      tournament.status === 'completed' ||
      tournament.status === 'FINISHED')
  ) {
    return true;
  }
  return false;
}
export async function getGenericQualifierPlayer(): Promise<Player | null> {
  const players = await sql`
    SELECT id, name, display_name, country, seed
    FROM players
    WHERE name = 'Qualifier'
    LIMIT 1
  `;
  return players.length > 0 ? (players[0] as Player) : null;
}
