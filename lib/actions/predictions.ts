'use server'

import { createPrediction, isUserEnrolled } from '@/lib/data'
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

  // Verify match is open for predictions
  const match = await sql`
    SELECT id, status FROM bracket_matches 
    WHERE id = ${bracketMatchId} AND tournament_id = ${tournamentId}
  `
  if (match.length === 0) throw new Error('Partida não encontrada')
  if (match[0].status === 'completed') throw new Error('Esta partida já foi finalizada')

  await createPrediction(userId, bracketMatchId, predictedWinnerId)
  revalidatePath(`/torneio/${tournamentId}`)
}
