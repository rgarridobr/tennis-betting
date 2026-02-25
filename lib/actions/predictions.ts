'use server'

import { createPrediction, isUserEnrolled, hasTournamentStarted } from '@/lib/data'
import { sql } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function makePredictionAction(
  userId: number,
  bracketMatchId: number,
  predictedWinnerId: number,
  tournamentId: number
) {
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId)
  if (!enrolled) {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites')
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId)
  if (started) {
    throw new Error('O torneio já começou e não é mais possível fazer palpites')
  }

  await createPrediction(userId, bracketMatchId, predictedWinnerId)
}

export async function saveFullBracketAction(
  userId: number,
  tournamentId: number,
  predictions: Array<{ matchId: number; winnerId: number; score?: string }>,
  isConcluded: boolean = false
) {
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId)
  if (!enrolled) {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites')
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId)
  if (started) {
    throw new Error('O torneio já começou e não é mais possível alterar os palpites')
  }

  // Batch insert/update predictions
  for (const p of predictions) {
    await sql`
      INSERT INTO predictions (user_id, bracket_match_id, predicted_winner_id, predicted_score)
      VALUES (${userId}, ${p.matchId}, ${p.winnerId}, ${p.score || null})
      ON CONFLICT (user_id, bracket_match_id)
      DO UPDATE SET predicted_winner_id = ${p.winnerId}, predicted_score = ${p.score || null}
    `
  }

  if (isConcluded) {
    await sql`
      UPDATE user_tournaments
      SET bracket_submitted = TRUE
      WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
    `
  }

  revalidatePath(`/torneio/${tournamentId}`)
  return { success: true }
}
