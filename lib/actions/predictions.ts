'use server';

import { createPrediction, isUserEnrolled, hasTournamentStarted } from '@/lib/data';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function makePredictionAction(
  userId: number,
  bracketMatchId: number,
  predictedWinnerId: number,
  tournamentId: number,
) {
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId);
  if (!enrolled) {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites');
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId);
  if (started) {
    throw new Error('O torneio já começou e não é mais possível fazer palpites');
  }

  await createPrediction(userId, bracketMatchId, predictedWinnerId);
}

export async function saveFullBracketAction(
  userId: number,
  tournamentId: number,
  predictions: Array<{ matchId: number; winnerId: number; score?: string }>,
) {
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId);
  if (!enrolled) {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites');
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId);
  if (started) {
    throw new Error(
      'O torneio já começou e não é mais possível alterar os palpites. Por favor, aperte a tecla F5 para atualizar a página.',
    );
  }

  // Batch insert/update predictions
  const matchIds = predictions.map((p) => p.matchId);

  // 1. Delete predictions that are no longer in the provided list for this tournament
  if (matchIds.length > 0) {
    await sql`
      DELETE FROM predictions
      WHERE user_id = ${userId}
      AND bracket_match_id IN (
        SELECT id FROM bracket_matches WHERE tournament_id = ${tournamentId}
      )
      AND bracket_match_id NOT IN (SELECT unnest(${matchIds}::int[]))
    `;
  } else {
    await sql`
      DELETE FROM predictions
      WHERE user_id = ${userId}
      AND bracket_match_id IN (
        SELECT id FROM bracket_matches WHERE tournament_id = ${tournamentId}
      )
    `;
  }

  // 2. Insert/Update predictions
  for (const p of predictions) {
    await sql`
      INSERT INTO predictions (user_id, bracket_match_id, predicted_winner_id, predicted_score)
      VALUES (${userId}, ${p.matchId}, ${p.winnerId}, ${p.score || null})
      ON CONFLICT (user_id, bracket_match_id)
      DO UPDATE SET predicted_winner_id = ${p.winnerId}, predicted_score = ${p.score || null}
    `;
  }

  revalidatePath(`/torneio/${tournamentId}`);
  return { success: true };
}
