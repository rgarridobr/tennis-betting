import { sql } from './db'

export interface Ranking {
  id: number
  date: string
  created_at: string
}

export interface PlayerRanking {
  ranking_id: number
  player_id: number
  position: number
  points: number
  player_name?: string
}

export async function createRanking(date: string): Promise<number> {
  const result = await sql`
    INSERT INTO rankings (date)
    VALUES (${date})
    RETURNING id
  `
  return result[0].id as number
}

export async function savePlayerRankings(rankingId: number, rankings: Array<{ player_id: number; position: number; points: number }>) {
  for (const r of rankings) {
    await sql`
      INSERT INTO player_rankings (ranking_id, player_id, position, points)
      VALUES (${rankingId}, ${r.player_id}, ${r.position}, ${r.points})
      ON CONFLICT (ranking_id, player_id) DO UPDATE SET
        position = EXCLUDED.position,
        points = EXCLUDED.points
    `
  }
}

export async function getRankings(): Promise<Ranking[]> {
  const rows = await sql`SELECT * FROM rankings ORDER BY date DESC`
  return rows as Ranking[]
}

export async function getRankingById(id: number): Promise<Ranking | null> {
  const rows = await sql`SELECT * FROM rankings WHERE id = ${id}`
  return rows.length > 0 ? (rows[0] as Ranking) : null
}

export async function getPlayerRankings(rankingId: number): Promise<PlayerRanking[]> {
  const rows = await sql`
    SELECT pr.*, p.name as player_name
    FROM player_rankings pr
    JOIN players p ON pr.player_id = p.id
    WHERE pr.ranking_id = ${rankingId}
    ORDER BY pr.position ASC
  `
  return rows as PlayerRanking[]
}

export async function getLatestRanking(): Promise<Ranking | null> {
  const rows = await sql`SELECT * FROM rankings ORDER BY date DESC LIMIT 1`
  return rows.length > 0 ? (rows[0] as Ranking) : null
}

export async function getPlayerRankingAtCutoff(playerId: number, rankingId: number): Promise<PlayerRanking | null> {
  const rows = await sql`
    SELECT * FROM player_rankings
    WHERE player_id = ${playerId} AND ranking_id = ${rankingId}
  `
  return rows.length > 0 ? (rows[0] as PlayerRanking) : null
}
