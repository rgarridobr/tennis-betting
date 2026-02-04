import { sql } from './db'

export interface Tournament {
  id: number
  name: string
  surface: string
  location: string
  start_date: string
  end_date: string
  image_url: string | null
  status: 'upcoming' | 'live' | 'finished'
  entry_fee: number
  created_at: string
}

export interface UserTournamentStatus {
  is_enrolled: boolean
  payment_status: 'pending' | 'paid' | null
  paid_at: string | null
}

export interface Match {
  id: number
  tournament_id: number
  player1_name: string
  player2_name: string
  player1_country: string
  player2_country: string
  round: string
  match_date: string
  player1_score: string | null
  player2_score: string | null
  winner: number | null
  status: 'scheduled' | 'live' | 'finished'
}

export interface Prediction {
  id: number
  user_id: number
  match_id: number
  predicted_winner: number
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

export async function getTournaments(): Promise<Tournament[]> {
  const tournaments = await sql`
    SELECT * FROM tournaments ORDER BY start_date DESC
  `
  return tournaments as Tournament[]
}

export async function getLiveTournaments(): Promise<Tournament[]> {
  const tournaments = await sql`
    SELECT * FROM tournaments WHERE status = 'live' ORDER BY start_date ASC
  `
  return tournaments as Tournament[]
}

export async function getUpcomingTournaments(): Promise<Tournament[]> {
  const tournaments = await sql`
    SELECT * FROM tournaments WHERE status = 'upcoming' ORDER BY start_date ASC
  `
  return tournaments as Tournament[]
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  const tournaments = await sql`
    SELECT * FROM tournaments WHERE id = ${id}
  `
  return tournaments[0] as Tournament | null
}

export async function getMatchesByTournament(tournamentId: number): Promise<Match[]> {
  const matches = await sql`
    SELECT * FROM matches 
    WHERE tournament_id = ${tournamentId}
    ORDER BY match_date ASC, round ASC
  `
  return matches as Match[]
}

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
    WHERE ut.user_id = ${userId} AND t.status IN ('upcoming', 'live')
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

export async function getGlobalRanking(limit: number = 10): Promise<RankingEntry[]> {
  const ranking = await sql`
    SELECT 
      u.id as user_id,
      u.name as user_name,
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
  
  return ranking.map((r, index) => ({
    user_id: r.user_id as number,
    user_name: r.user_name as string,
    correct_predictions: Number(r.correct_predictions || 0),
    total_predictions: Number(r.total_predictions || 0),
    total_points: Number(r.total_points || 0),
    rank: index + 1,
  }))
}

export async function getUserRanking(userId: number): Promise<RankingEntry | null> {
  const ranking = await getGlobalRanking(1000)
  const userEntry = ranking.find(r => r.user_id === userId)
  return userEntry || null
}

export async function getUserTournamentStatus(
  userId: number,
  tournamentId: number
): Promise<UserTournamentStatus> {
  const result = await sql`
    SELECT payment_status, paid_at FROM user_tournaments 
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
  
  if (result.length === 0) {
    return { is_enrolled: false, payment_status: null, paid_at: null }
  }
  
  return {
    is_enrolled: true,
    payment_status: result[0].payment_status as 'pending' | 'paid',
    paid_at: result[0].paid_at as string | null,
  }
}

export async function enrollInTournament(
  userId: number,
  tournamentId: number
): Promise<void> {
  await sql`
    INSERT INTO user_tournaments (user_id, tournament_id, payment_status)
    VALUES (${userId}, ${tournamentId}, 'pending')
    ON CONFLICT (user_id, tournament_id) DO NOTHING
  `
}

export async function confirmTournamentPayment(
  userId: number,
  tournamentId: number
): Promise<void> {
  await sql`
    UPDATE user_tournaments 
    SET payment_status = 'paid', paid_at = NOW()
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `
}

export async function getUserTournaments(userId: number): Promise<Tournament[]> {
  const tournaments = await sql`
    SELECT t.* FROM tournaments t
    JOIN user_tournaments ut ON t.id = ut.tournament_id
    WHERE ut.user_id = ${userId} AND ut.payment_status = 'paid'
    ORDER BY t.start_date DESC
  `
  return tournaments as Tournament[]
}

export async function getTournamentParticipants(tournamentId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM user_tournaments 
    WHERE tournament_id = ${tournamentId} AND payment_status = 'paid'
  `
  return Number(result[0]?.count || 0)
}

export async function getTournamentPrizePool(tournamentId: number): Promise<number> {
  const result = await sql`
    SELECT t.entry_fee, COUNT(ut.user_id) as participants
    FROM tournaments t
    LEFT JOIN user_tournaments ut ON t.id = ut.tournament_id AND ut.payment_status = 'paid'
    WHERE t.id = ${tournamentId}
    GROUP BY t.id, t.entry_fee
  `
  const entryFee = Number(result[0]?.entry_fee || 0)
  const participants = Number(result[0]?.participants || 0)
  return entryFee * participants
}

export async function createPrediction(
  userId: number,
  matchId: number,
  predictedWinner: number
): Promise<void> {
  await sql`
    INSERT INTO predictions (user_id, match_id, predicted_winner)
    VALUES (${userId}, ${matchId}, ${predictedWinner})
    ON CONFLICT (user_id, match_id) 
    DO UPDATE SET predicted_winner = ${predictedWinner}
  `
}

export async function getUserPredictions(userId: number, tournamentId?: number): Promise<Prediction[]> {
  if (tournamentId) {
    const predictions = await sql`
      SELECT p.* FROM predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.user_id = ${userId} AND m.tournament_id = ${tournamentId}
    `
    return predictions as Prediction[]
  }
  
  const predictions = await sql`
    SELECT * FROM predictions WHERE user_id = ${userId}
  `
  return predictions as Prediction[]
}

export interface PredictionWithDetails {
  id: number
  match_id: number
  predicted_winner: number
  is_correct: boolean | null
  points_earned: number
  created_at: string
  player1_name: string
  player2_name: string
  player1_country: string
  player2_country: string
  round: string
  match_date: string
  match_status: string
  winner: number | null
  tournament_id: number
  tournament_name: string
  tournament_surface: string
}

export async function getUserPredictionsWithDetails(userId: number): Promise<PredictionWithDetails[]> {
  const predictions = await sql`
    SELECT 
      p.id,
      p.match_id,
      p.predicted_winner,
      p.is_correct,
      p.points_earned,
      p.created_at,
      m.player1_name,
      m.player2_name,
      m.player1_country,
      m.player2_country,
      m.round,
      m.match_date,
      m.status as match_status,
      m.winner,
      t.id as tournament_id,
      t.name as tournament_name,
      t.surface as tournament_surface
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    JOIN tournaments t ON m.tournament_id = t.id
    WHERE p.user_id = ${userId}
    ORDER BY m.match_date DESC
  `
  return predictions as PredictionWithDetails[]
}

export async function getUserPredictionsByTournament(userId: number): Promise<Record<number, PredictionWithDetails[]>> {
  const predictions = await getUserPredictionsWithDetails(userId)
  
  const grouped: Record<number, PredictionWithDetails[]> = {}
  for (const p of predictions) {
    if (!grouped[p.tournament_id]) {
      grouped[p.tournament_id] = []
    }
    grouped[p.tournament_id].push(p)
  }
  
  return grouped
}
