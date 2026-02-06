import { sql } from './db'

// ==================== INTERFACES ====================

export interface Tournament {
  id: number
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export interface Match {
  id: number
  tournament_id: number
  round: string
  match_number: number
  player1_name: string | null
  player2_name: string | null
  player1_seed: number | null
  player2_seed: number | null
  score: string | null
  winner_name: string | null
  status: string
  match_date: string | null
  next_match_id: number | null
}

export interface Prediction {
  id: number
  user_id: number
  match_id: number
  predicted_winner: string
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
  match_id: number
  predicted_winner: string
  is_correct: boolean | null
  points_earned: number
  created_at: string
  player1_name: string | null
  player2_name: string | null
  round: string
  match_date: string | null
  score: string | null
  match_status: string
  winner_name: string | null
  tournament_id: number
  tournament_name: string
}

// ==================== ROUND CONFIG ====================

export const ROUND_ORDER = [
  '1ª Rodada',
  '2ª Rodada',
  '3ª Rodada',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinais',
  'Final'
]

export const ROUND_MATCHES: Record<string, number> = {
  '1ª Rodada': 64,
  '2ª Rodada': 32,
  '3ª Rodada': 16,
  'Oitavas de Final': 8,
  'Quartas de Final': 4,
  'Semifinais': 2,
  'Final': 1
}

export const ROUND_POINTS: Record<string, number> = {
  '1ª Rodada': 5,
  '2ª Rodada': 10,
  '3ª Rodada': 15,
  'Oitavas de Final': 20,
  'Quartas de Final': 30,
  'Semifinais': 40,
  'Final': 50
}

// ==================== TOURNAMENTS ====================

export async function getTournaments(): Promise<Tournament[]> {
  const rows = await sql`SELECT * FROM tournaments ORDER BY start_date DESC`
  return rows as Tournament[]
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  const rows = await sql`SELECT * FROM tournaments WHERE id = ${id}`
  return rows.length > 0 ? (rows[0] as Tournament) : null
}

// ==================== MATCHES ====================

export async function getMatchesByTournament(tournamentId: number): Promise<Match[]> {
  const rows = await sql`
    SELECT * FROM matches 
    WHERE tournament_id = ${tournamentId}
    ORDER BY 
      CASE round
        WHEN '1ª Rodada' THEN 1
        WHEN '2ª Rodada' THEN 2
        WHEN '3ª Rodada' THEN 3
        WHEN 'Oitavas de Final' THEN 4
        WHEN 'Quartas de Final' THEN 5
        WHEN 'Semifinais' THEN 6
        WHEN 'Final' THEN 7
      END,
      match_number ASC
  `
  return rows as Match[]
}

export async function getMatchesByRound(tournamentId: number, round: string): Promise<Match[]> {
  const rows = await sql`
    SELECT * FROM matches 
    WHERE tournament_id = ${tournamentId} AND round = ${round}
    ORDER BY match_number ASC
  `
  return rows as Match[]
}

// ==================== PREDICTIONS ====================

export async function createPrediction(
  userId: number,
  matchId: number,
  predictedWinner: string
): Promise<void> {
  await sql`
    INSERT INTO predictions (user_id, match_id, predicted_winner)
    VALUES (${userId}, ${matchId}, ${predictedWinner})
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET predicted_winner = ${predictedWinner}
  `
}

export async function getUserPredictions(userId: number, tournamentId: number): Promise<Prediction[]> {
  const rows = await sql`
    SELECT p.* FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ${userId} AND m.tournament_id = ${tournamentId}
  `
  return rows as Prediction[]
}

export async function getUserPredictionsWithDetails(userId: number): Promise<PredictionWithDetails[]> {
  const rows = await sql`
    SELECT 
      p.id, p.match_id, p.predicted_winner, p.is_correct, p.points_earned, p.created_at,
      m.player1_name, m.player2_name, m.round, m.match_date, m.score,
      m.status as match_status, m.winner_name,
      t.id as tournament_id, t.name as tournament_name
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    JOIN tournaments t ON m.tournament_id = t.id
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
    WHERE ut.user_id = ${userId} AND t.status IN ('upcoming', 'active')
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
      COUNT(CASE WHEN p.is_correct = true THEN 1 END) as correct_predictions,
      COUNT(p.id) as total_predictions,
      COALESCE(SUM(p.points_earned), 0) as total_points
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
    WHERE u.is_admin = false
    GROUP BY u.id, u.name
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

// ==================== USER TOURNAMENTS ====================

export async function getUserTournamentStatus(userId: number, tournamentId: number) {
  const rows = await sql`
    SELECT * FROM user_tournaments 
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
  if (rows.length === 0) {
    return { is_enrolled: false, payment_status: null }
  }
  return { is_enrolled: true, payment_status: rows[0].payment_status }
}

export async function enrollInTournament(userId: number, tournamentId: number): Promise<void> {
  await sql`
    INSERT INTO user_tournaments (user_id, tournament_id, payment_status)
    VALUES (${userId}, ${tournamentId}, 'pending')
    ON CONFLICT (user_id, tournament_id) DO NOTHING
  `
}

export async function confirmTournamentPayment(userId: number, tournamentId: number): Promise<void> {
  await sql`
    UPDATE user_tournaments SET payment_status = 'paid', paid_at = NOW()
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
}

export async function getTournamentParticipants(tournamentId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM user_tournaments 
    WHERE tournament_id = ${tournamentId} AND payment_status = 'paid'
  `
  return Number(result[0]?.count || 0)
}
