'use server';

import { createPrediction, isUserEnrolled, hasTournamentStarted } from '@/lib/data';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

type BracketPredictionInput = { matchId: number; winnerId: number; score?: string };

type BracketMatchRow = {
  id: number;
  round: number;
  position: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_type: string | null;
  player2_type: string | null;
};

async function validateFullBracketPredictions(
  tournamentId: number,
  predictions: BracketPredictionInput[],
): Promise<BracketPredictionInput[]> {
  const t = await getTranslations('errors');
  const matches = (await sql`
    SELECT id, round, position, player1_id, player2_id, player1_type, player2_type
    FROM bracket_matches
    WHERE tournament_id = ${tournamentId}
    ORDER BY round ASC, position ASC
  `) as BracketMatchRow[];

  if (matches.length === 0) {
    throw new Error(t('bracketUnavailable'));
  }

  const genericQualifier = await sql`
    SELECT id
    FROM players
    WHERE name = 'Qualifier'
    LIMIT 1
  `;
  const qualifierPlayerId = genericQualifier.length > 0 ? Number(genericQualifier[0].id) : null;
  const predictionsByMatch = new Map<number, BracketPredictionInput>();

  for (const prediction of predictions) {
    if (!Number.isInteger(prediction.matchId) || !Number.isInteger(prediction.winnerId)) {
      throw new Error(t('invalidPrediction'));
    }
    predictionsByMatch.set(prediction.matchId, prediction);
  }

  const matchIds = new Set(matches.map((match) => match.id));
  for (const matchId of predictionsByMatch.keys()) {
    if (!matchIds.has(matchId)) {
      throw new Error(t('invalidPredictionTournament'));
    }
  }

  const matchesMap = new Map<string, BracketMatchRow>();
  const rounds = Array.from(new Set(matches.map((match) => match.round))).sort((a, b) => a - b);

  for (const match of matches) {
    matchesMap.set(`${match.round}-${match.position}`, match);
  }

  const isRealPlayerId = (playerId: number | null | undefined) => !!playerId && playerId !== qualifierPlayerId;
  const isQualifierSlot = (playerType: string | null | undefined) =>
    playerType === 'QUALIFIER' || playerType === 'LUCKY_LOSER';
  const addMatchPlayerOptions = (match: BracketMatchRow, options: number[]) => {
    if (isRealPlayerId(match.player1_id)) options.push(match.player1_id!);
    if (isRealPlayerId(match.player2_id)) options.push(match.player2_id!);
    if (isQualifierSlot(match.player1_type) && qualifierPlayerId) options.push(qualifierPlayerId);
    if (isQualifierSlot(match.player2_type) && qualifierPlayerId) options.push(qualifierPlayerId);
  };

  const resolvedWinners = new Map<number, number>();

  for (const round of rounds) {
    const roundMatches = matches.filter((match) => match.round === round);

    for (const match of roundMatches) {
      const prediction = predictionsByMatch.get(match.id);
      if (!prediction?.winnerId) {
        continue;
      }

      let validWinnerIds: number[] = [];

      if (match.round === 1) {
        addMatchPlayerOptions(match, validWinnerIds);
      } else {
        const previousRound = match.round - 1;
        const previousMatch1 = matchesMap.get(`${previousRound}-${match.position * 2 - 1}`);
        const previousMatch2 = matchesMap.get(`${previousRound}-${match.position * 2}`);
        const winner1 = previousMatch1 ? resolvedWinners.get(previousMatch1.id) : undefined;
        const winner2 = previousMatch2 ? resolvedWinners.get(previousMatch2.id) : undefined;

        if (winner1) validWinnerIds.push(winner1);
        if (winner2) validWinnerIds.push(winner2);
        addMatchPlayerOptions(match, validWinnerIds);
      }

      validWinnerIds = Array.from(new Set(validWinnerIds));

      if (validWinnerIds.length === 0 || !validWinnerIds.includes(prediction.winnerId)) {
        throw new Error(t('invalidChain'));
      }

      resolvedWinners.set(match.id, prediction.winnerId);
    }
  }

  return Array.from(predictionsByMatch.values());
}

export async function makePredictionAction(
  userId: number,
  bracketMatchId: number,
  predictedWinnerId: number,
  tournamentId: number,
) {
  const t = await getTranslations('errors');
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId);
  if (!enrolled) {
    throw new Error(t('mustEnroll'));
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId);
  if (started) {
    throw new Error(t('tournamentStarted'));
  }

  await createPrediction(userId, bracketMatchId, predictedWinnerId);
}

export async function saveFullBracketAction(
  userId: number,
  tournamentId: number,
  predictions: BracketPredictionInput[],
) {
  const t = await getTranslations('errors');
  // Verify user is enrolled
  const enrolled = await isUserEnrolled(userId, tournamentId);
  if (!enrolled) {
    throw new Error(t('mustEnroll'));
  }

  // Verify tournament hasn't started
  const started = await hasTournamentStarted(tournamentId);
  if (started) {
    throw new Error(t('tournamentStartedEdit'));
  }

  const validPredictions = await validateFullBracketPredictions(tournamentId, predictions);

  // Batch insert/update predictions
  const matchIds = validPredictions.map((p) => p.matchId);

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
  for (const p of validPredictions) {
    await sql`
      INSERT INTO predictions (user_id, bracket_match_id, predicted_winner_id, predicted_score)
      VALUES (${userId}, ${p.matchId}, ${p.winnerId}, ${p.score || null})
      ON CONFLICT (user_id, bracket_match_id)
      DO UPDATE SET predicted_winner_id = ${p.winnerId}, predicted_score = ${p.score || null}
    `;
  }

  await sql`
    UPDATE user_tournaments
    SET bracket_submitted = true
    WHERE user_id = ${userId} AND tournament_id = ${tournamentId}
  `;

  revalidatePath(`/torneios/${tournamentId}`);
  return { success: true };
}
