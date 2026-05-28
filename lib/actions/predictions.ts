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
  // IMPORTANT: Only delete predictions for Round 1 matches that have BOTH players defined.
  // This prevents losing predictions when the user saves before all qualifiers are confirmed.
  // For rounds > 1, predictions are always managed by the cascade logic in the frontend.
  if (matchIds.length > 0) {
    await sql`
      DELETE FROM predictions
      WHERE user_id = ${userId}
      AND bracket_match_id IN (
        SELECT id FROM bracket_matches 
        WHERE tournament_id = ${tournamentId}
        AND (
          round > 1 
          OR (round = 1 AND player1_id IS NOT NULL AND player2_id IS NOT NULL)
        )
      )
      AND bracket_match_id NOT IN (SELECT unnest(${matchIds}::int[]))
    `;
  } else {
    await sql`
      DELETE FROM predictions
      WHERE user_id = ${userId}
      AND bracket_match_id IN (
        SELECT id FROM bracket_matches 
        WHERE tournament_id = ${tournamentId}
        AND (
          round > 1 
          OR (round = 1 AND player1_id IS NOT NULL AND player2_id IS NOT NULL)
        )
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

  // 3. Update bracket_submitted flag if final is predicted
  const hasFinal = await sql`
    SELECT 1 FROM bracket_matches bm
    JOIN predictions p ON bm.id = p.bracket_match_id
    WHERE p.user_id = ${userId} 
    AND bm.tournament_id = ${tournamentId}
    AND bm.round = (SELECT MAX(round) FROM bracket_matches WHERE tournament_id = ${tournamentId})
    LIMIT 1
  `;

  if (hasFinal.length > 0) {
    await sql`
      UPDATE user_tournaments 
      SET bracket_submitted = true 
      WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
    `;
  }

  revalidatePath(`/torneios/${tournamentId}`);
  return { success: true };
}
