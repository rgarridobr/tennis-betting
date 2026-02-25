import { sql } from './db'

// ==================== INTERFACES ====================

export interface Tournament {
  id: number
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  image_url: string | null
  status: string
  created_at: string
  category: string
  category_custom: string | null
  format: string
  sets_format: number
  size: number
  has_seeds: boolean
  has_qualifiers: boolean
  has_wildcards: boolean
  has_byes: boolean
  champion_id: number | null
  runner_up_id: number | null
}

export interface Player {
  id: number
  name: string
  country: string | null
  seed: number | null
}

export interface TournamentMetadata {
  id: number
  name: string
}

export interface BracketMatch {
  id: number
  tournament_id: number
  round: number
  position: number
  player1_id: number | null
  player2_id: number | null
  winner_id: number | null
  score: string | null
  match_date: string | null
  status: string
  player1_type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'
  player2_type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'
  player1_seed: number | null
  player2_seed: number | null
  // Joined player names
  player1_name: string | null
  player1_country: string | null
  player1_seed_val: number | null // Renamed from player1_seed to avoid conflict with bracket_matches.player1_seed
  player2_name: string | null
  player2_country: string | null
  player2_seed_val: number | null
  winner_name: string | null
}

export interface Prediction {
  id: number
  user_id: number
  bracket_match_id: number
  predicted_winner_id: number
  predicted_score: string | null
  is_correct: boolean | null
  points_earned: number
  created_at: string
}

export interface UserStats {
  total_points: number
  correct_predictions: number
  wrong_predictions: number
  total_predictions: number
  accuracy: number
  active_tournaments: number
}

export interface RankingEntry {
  user_id: number
  user_name: string
  correct_predictions: number
  total_predictions: number
  total_points: number
  rank: number
}

export interface PredictionWithDetails {
  id: number
  bracket_match_id: number
  predicted_winner_id: number
  predicted_winner_name: string
  is_correct: boolean | null
  points_earned: number
  created_at: string
  player1_name: string | null
  player2_name: string | null
  player1_type: string
  player2_type: string
  player1_seed: number | null
  player2_seed: number | null
  round: number
  match_date: string | null
  score: string | null
  match_status: string
  winner_name: string | null
  tournament_id: number
  tournament_name: string
  tournament_size: number
}

// ==================== ROUND CONFIG ====================

export const ROUND_MATCHES: Record<number, number> = {
  1: 64,
  2: 32,
  3: 16,
  4: 8,
  5: 4,
  6: 2,
  7: 1
}

export const ROUND_POINTS: Record<number, number> = {
  1: 10,
  2: 45,
  3: 90,
  4: 180,
  5: 360,
  6: 720,
  7: 2000
}

// ==================== TOURNAMENTS ====================

export async function getTournamentsActive(): Promise<Tournament[]> {
  const rows = await sql`SELECT * FROM tournaments WHERE status = 'active' ORDER BY start_date DESC`
  return rows as Tournament[]
}

export async function getTournaments(): Promise<Tournament[]> {
  const rows = await sql`SELECT * FROM tournaments ORDER BY start_date DESC`
  return rows as Tournament[]
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  const rows = await sql`SELECT * FROM tournaments WHERE id = ${id}`
  return rows.length > 0 ? (rows[0] as Tournament) : null
}

// ==================== PLAYERS ====================

export async function getPlayers(): Promise<Player[]> {
  const rows = await sql`SELECT * FROM players ORDER BY seed NULLS LAST, name ASC`
  return rows as Player[]
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const rows = await sql`SELECT * FROM players WHERE id = ${id}`
  return rows.length > 0 ? (rows[0] as Player) : null
}

export async function getTournamentNames(): Promise<TournamentMetadata[]> {
  const rows = await sql`SELECT * FROM tournament_names ORDER BY name ASC`
  return rows as TournamentMetadata[]
}

export async function getTournamentLocations(): Promise<TournamentMetadata[]> {
  const rows = await sql`SELECT * FROM tournament_locations ORDER BY name ASC`
  return rows as TournamentMetadata[]
}

// ==================== BRACKET MATCHES ====================

export async function getBracketMatches(tournamentId: number): Promise<BracketMatch[]> {
  const rows = await sql`
    SELECT 
      bm.*,
      p1.name as player1_name, p1.country as player1_country, p1.seed as player1_seed_val,
      p2.name as player2_name, p2.country as player2_country, p2.seed as player2_seed_val,
      w.name as winner_name
    FROM bracket_matches bm
    LEFT JOIN players p1 ON bm.player1_id = p1.id
    LEFT JOIN players p2 ON bm.player2_id = p2.id
    LEFT JOIN players w ON bm.winner_id = w.id
    WHERE bm.tournament_id = ${tournamentId}
    ORDER BY bm.round ASC, bm.position ASC
  `
  return rows as BracketMatch[]
}

export async function getBracketMatchesByRound(tournamentId: number, round: number): Promise<BracketMatch[]> {
  const rows = await sql`
    SELECT 
      bm.*,
      p1.name as player1_name, p1.country as player1_country, p1.seed as player1_seed_val,
      p2.name as player2_name, p2.country as player2_country, p2.seed as player2_seed_val,
      w.name as winner_name
    FROM bracket_matches bm
    LEFT JOIN players p1 ON bm.player1_id = p1.id
    LEFT JOIN players p2 ON bm.player2_id = p2.id
    LEFT JOIN players w ON bm.winner_id = w.id
    WHERE bm.tournament_id = ${tournamentId} AND bm.round = ${round}
    ORDER BY bm.position ASC
  `
  return rows as BracketMatch[]
}

// ==================== PREDICTIONS ====================

export async function createPrediction(
  userId: number,
  bracketMatchId: number,
  predictedWinnerId: number
): Promise<void> {
  await sql`
    INSERT INTO predictions (user_id, bracket_match_id, predicted_winner_id)
    VALUES (${userId}, ${bracketMatchId}, ${predictedWinnerId})
    ON CONFLICT (user_id, bracket_match_id) 
    DO UPDATE SET predicted_winner_id = ${predictedWinnerId}
  `
}

export async function getUserPredictions(userId: number, tournamentId: number): Promise<Prediction[]> {
  const rows = await sql`
    SELECT p.* FROM predictions p
    JOIN bracket_matches bm ON p.bracket_match_id = bm.id
    WHERE p.user_id = ${userId} AND bm.tournament_id = ${tournamentId}
  `
  return rows as Prediction[]
}

export async function getUserPredictionsWithDetails(userId: number): Promise<PredictionWithDetails[]> {
  const rows = await sql`
    SELECT 
      p.id, p.bracket_match_id, p.predicted_winner_id, p.is_correct, p.points_earned, p.created_at,
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
  `
  return rows as PredictionWithDetails[]
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
    WHERE p.user_id = ${userId}
  `
  const activeTournaments = await sql`
    SELECT COUNT(DISTINCT ut.tournament_id) as count
    FROM user_tournaments ut
    JOIN tournaments t ON ut.tournament_id = t.id
    WHERE ut.user_id = ${userId} AND t.status IN ('upcoming', 'active', 'published')
  `
  const totalPoints = Number(stats[0]?.total_points || 0)
  const correct = Number(stats[0]?.correct_predictions || 0)
  const wrong = Number(stats[0]?.wrong_predictions || 0)
  const total = Number(stats[0]?.total_predictions || 0)
  const resolved = correct + wrong

  return {
    total_points: totalPoints,
    correct_predictions: correct,
    wrong_predictions: wrong,
    total_predictions: total,
    accuracy: resolved > 0 ? Math.round((correct / resolved) * 100) : 0,
    active_tournaments: Number(activeTournaments[0]?.count || 0),
  }
}

export async function getGlobalRanking(limit: number = 50): Promise<RankingEntry[]> {
  const ranking = await sql`
    SELECT 
      u.id as user_id, u.name as user_name,
      (SELECT COUNT(*) FROM predictions WHERE user_id = u.id AND is_correct = true) as correct_predictions,
      (SELECT COUNT(*) FROM predictions WHERE user_id = u.id) as total_predictions,
      COALESCE((SELECT SUM(points_earned) FROM predictions WHERE user_id = u.id), 0) as total_points
    FROM users u
    WHERE u.is_admin = false
    ORDER BY total_points DESC, correct_predictions DESC
    LIMIT ${limit}
  `
  return ranking.map((r, i) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: Number(r.correct_predictions || 0),
    total_predictions: Number(r.total_predictions || 0),
    total_points: Number(r.total_points || 0),
    rank: i + 1,
  }))
}

export async function getUserRanking(userId: number): Promise<RankingEntry | null> {
  const ranking = await getGlobalRanking(1000)
  return ranking.find(r => r.user_id === userId) || null
}

// ==================== ENROLLMENT ====================

export interface Enrollment {
  id: number
  user_id: number
  tournament_id: number
  bracket_submitted: boolean
}

export async function getEnrollment(userId: number, tournamentId: number): Promise<Enrollment | null> {
  const rows = await sql`
    SELECT * FROM user_tournaments
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
  return rows.length > 0 ? (rows[0] as Enrollment) : null
}

export async function isUserEnrolled(userId: number, tournamentId: number): Promise<boolean> {
  const enrollment = await getEnrollment(userId, tournamentId)
  return !!enrollment
}

export async function enrollUser(userId: number, tournamentId: number): Promise<void> {
  await sql`
    INSERT INTO user_tournaments (user_id, tournament_id)
    VALUES (${userId}, ${tournamentId})
    ON CONFLICT (user_id, tournament_id) DO NOTHING
  `
}

export async function getTournamentParticipantCount(tournamentId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM user_tournaments WHERE tournament_id = ${tournamentId}
  `
  return Number(result[0]?.count || 0)
}


export async function getTournamentPlayers(tournamentId: number): Promise<Player[]> {
  const players = await sql`
    SELECT DISTINCT p.id, p.name, p.country, p.seed
    FROM players p
    JOIN bracket_matches bm ON (p.id = bm.player1_id OR p.id = bm.player2_id)
    WHERE bm.tournament_id = ${tournamentId}
    ORDER BY p.name ASC
  `
  return players as Player[]
}

export async function hasTournamentStarted(tournamentId: number): Promise<boolean> {
  // Check if current time is after tournament start date
  const tournament = await getTournamentById(tournamentId)
  if (tournament && new Date(tournament.start_date) <= new Date()) {
    return true
  }

  const result = await sql`
    SELECT COUNT(*) as count
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId} AND status = 'completed' AND score != 'BYE'
  `
  return Number(result[0]?.count || 0) > 0
}
