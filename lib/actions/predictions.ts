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

export async function saveBonusPredictionsAction(
  userId: number,
  tournamentId: number,
  data: {
    champion_id: number | null
    runner_up_id: number | null
    semi1_id: number | null
    semi2_id: number | null
    semi3_id: number | null
    semi4_id: number | null
  }
) {
  // Verify enrollment
  const enrolled = await isUserEnrolled(userId, tournamentId)
  if (!enrolled) {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites')
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId)
  if (started) {
    throw new Error('O torneio já começou e não é mais possível alterar os palpites bônus')
  }

  // Validate distinct semis
  const semis = [data.semi1_id, data.semi2_id, data.semi3_id, data.semi4_id].filter(id => id !== null)
  const distinctSemis = new Set(semis)
  if (distinctSemis.size !== semis.length) {
    throw new Error('Os 4 semifinalistas devem ser jogadores diferentes')
  }

  await sql`
    INSERT INTO bonus_predictions (
      user_id, tournament_id, champion_id, runner_up_id,
      semi1_id, semi2_id, semi3_id, semi4_id
    )
    VALUES (
      ${userId}, ${tournamentId}, ${data.champion_id}, ${data.runner_up_id},
      ${data.semi1_id}, ${data.semi2_id}, ${data.semi3_id}, ${data.semi4_id}
    )
    ON CONFLICT (user_id, tournament_id) DO UPDATE SET
      champion_id = EXCLUDED.champion_id,
      runner_up_id = EXCLUDED.runner_up_id,
      semi1_id = EXCLUDED.semi1_id,
      semi2_id = EXCLUDED.semi2_id,
      semi3_id = EXCLUDED.semi3_id,
      semi4_id = EXCLUDED.semi4_id,
      created_at = NOW()
  `

  revalidatePath(`/torneio/${tournamentId}`)
  return { success: true }
}
