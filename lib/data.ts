import { sql } from './db';

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
  rank: number;
  final_score_correct?: boolean;
  hit_champion?: boolean;
  hit_both?: boolean;
  global_points?: number;
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
    rounds: [null, null, 0, 25, 50, 100, 165, 250],
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
  const offset = config.rounds.length - 1 - totalRounds;
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
    AND status IN ('active', 'published', 'upcoming', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS') 
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

export async function getTournamentsByYearAndMonth(year: number, month: number): Promise<Tournament[]> {
  await syncTournamentStatuses();
  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments 
    WHERE is_visible = TRUE
    AND EXTRACT(YEAR FROM start_date) = ${year}
    AND EXTRACT(MONTH FROM start_date) = ${month}
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
      ORDER BY
        CASE
          WHEN status IN ('IN_PROGRESS', 'LOCKED', 'active') THEN 1
          WHEN status IN ('OPEN', 'UPCOMING', 'upcoming', 'published') THEN 2
          ELSE 3
        END ASC,
        start_date DESC
      LIMIT ${limit}
    `;
    return rows as Tournament[];
  }

  const rows = await sql`
    SELECT id, name, surface, location, start_date as start_date, end_date as end_date, image_url, status, created_at, category, category_custom, format, sets_format, size, has_seeds, has_qualifiers, has_wildcards, has_byes, is_visible, champion_id, runner_up_id
    FROM tournaments
    WHERE is_visible = TRUE
    ORDER BY
      CASE
        WHEN status IN ('IN_PROGRESS', 'LOCKED', 'active') THEN 1
        WHEN status IN ('OPEN', 'UPCOMING', 'upcoming', 'published') THEN 2
        ELSE 3
      END ASC,
      start_date DESC
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
  const stats = await sql`
    SELECT 
      COALESCE(SUM(p.points_earned), 0) as total_points,
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(CASE WHEN p.is_correct = false THEN 1 END) as wrong_predictions,
      COUNT(p.id) as total_predictions
    FROM predictions p
    JOIN bracket_matches m ON m.id = p.bracket_match_id
    JOIN tournaments t ON t.id = m.tournament_id
    WHERE 
      p.user_id = ${userId}
      AND p.is_correct IS NOT NULL
      AND t.status IN ('IN_PROGRESS')
      AND m.points_cancelled IS NOT TRUE
  `;

  const tournamentBreakdown = await sql`
    SELECT 
      t.id as tournament_id,
      t.name as tournament_name,
      COALESCE(SUM(p.points_earned), 0) as points,
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(CASE WHEN p.is_correct = false THEN 1 END) as wrong_predictions,
      COUNT(p.id) as total_predictions
    FROM predictions p
    JOIN bracket_matches m ON m.id = p.bracket_match_id
    JOIN tournaments t ON t.id = m.tournament_id
    WHERE 
      p.user_id = ${userId}
      AND p.is_correct IS NOT NULL
      AND t.status IN ('IN_PROGRESS')
      AND m.points_cancelled IS NOT TRUE
    GROUP BY t.id, t.name
    HAVING COUNT(p.id) > 0
    ORDER BY points DESC
  `;

  const activeTournaments = await sql`
    SELECT COUNT(DISTINCT ut.tournament_id) as count
    FROM user_tournaments ut
    JOIN tournaments t ON ut.tournament_id = t.id
    WHERE 
      ut.user_id = ${userId} 
      AND t.status IN ('upcoming', 'active', 'published', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS')
  `;
  const totalPoints = Number(stats[0]?.total_points || 0);
  const correct = Number(stats[0]?.correct_predictions || 0);
  const wrong = Number(stats[0]?.wrong_predictions || 0);
  const total = Number(stats[0]?.total_predictions || 0);
  const resolved = correct + wrong;

  return {
    total_points: totalPoints,
    correct_predictions: correct,
    wrong_predictions: wrong,
    total_predictions: total,
    accuracy: resolved > 0 ? Math.round((correct / resolved) * 100) : 0,
    active_tournaments: Number(activeTournaments[0]?.count || 0),
    tournament_stats: tournamentBreakdown.map((tb) => {
      const tbCorrect = Number(tb.correct_predictions || 0);
      const tbWrong = Number(tb.wrong_predictions || 0);
      const tbResolved = tbCorrect + tbWrong;
      return {
        tournament_id: Number(tb.tournament_id),
        tournament_name: String(tb.tournament_name),
        points: Number(tb.points || 0),
        correct_predictions: tbCorrect,
        total_predictions: Number(tb.total_predictions || 0),
        accuracy: tbResolved > 0 ? Math.round((tbCorrect / tbResolved) * 100) : 0,
      };
    }),
  };
}

export async function getGlobalRanking(limit: number = 50): Promise<RankingEntry[]> {
  const ranking = await sql`
    SELECT *
    FROM (
      SELECT 
        u.id as user_id,
        COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct = true AND bm.points_cancelled IS NOT TRUE) as correct_predictions,
        (SELECT COUNT(*) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND p.is_correct IS NOT NULL AND bm.points_cancelled IS NOT TRUE) as total_predictions,
        COALESCE((SELECT SUM(p.points_earned) FROM predictions p JOIN bracket_matches bm ON p.bracket_match_id = bm.id WHERE p.user_id = u.id AND bm.points_cancelled IS NOT TRUE), 0) as total_points
      FROM users u
      WHERE u.is_admin = false AND u.is_deleted = false
    ) r
    WHERE r.total_points > 0
    ORDER BY r.total_points DESC, r.correct_predictions DESC, r.user_name ASC
    LIMIT ${limit}`;
  return ranking.map((r, i) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: Number(r.correct_predictions || 0),
    total_predictions: Number(r.total_predictions || 0),
    total_points: Number(r.total_points || 0),
    rank: i + 1,
  }));
}

export async function getTournamentRanking(tournamentId: number, limit: number = 100): Promise<RankingEntry[]> {
  const ranking = await sql`
    WITH tournament_stats AS (
      SELECT
        u.id as user_id,
        COALESCE(NULLIF(u.nickname, ''), u.name) as user_name,
        COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
        COUNT(p.id) as total_predictions,
        COALESCE(SUM(p.points_earned), 0) as total_points,
        MAX(CASE WHEN p.is_correct = true AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId}) THEN 1 ELSE 0 END) as hit_champion,
        MAX(CASE WHEN p.is_runner_up_correct = true AND p.is_correct = true THEN 1 ELSE 0 END) as hit_both,
        COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as global_points
      FROM users u
      JOIN user_tournaments ut 
        ON u.id = ut.user_id
      LEFT JOIN bracket_matches bm 
        ON bm.tournament_id = ${tournamentId}
      LEFT JOIN predictions p 
        ON u.id = p.user_id 
        AND p.bracket_match_id = bm.id
      WHERE 
        ut.tournament_id = ${tournamentId} 
        AND u.is_admin = false 
        AND u.is_deleted = false
        AND bm.status = 'completed'
        AND bm.points_cancelled IS NOT TRUE
      GROUP BY u.id, u.name, u.nickname
    )
    SELECT * FROM tournament_stats
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

export async function getTournamentPlayers(tournamentId: number): Promise<Player[]> {
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
