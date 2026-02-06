'use server'

import { createPrediction, getUserTournamentStatus } from '@/lib/data'
import { revalidatePath } from 'next/cache'

export async function makePredictionAction(
  userId: number,
  matchId: number,
  predictedWinnerName: string,
  tournamentId: number
) {
  // Verify user has paid for this tournament before allowing prediction
  const status = await getUserTournamentStatus(userId, tournamentId)
  
  if (status.payment_status !== 'paid') {
    throw new Error('Você precisa estar inscrito no torneio para fazer palpites')
  }
  
  await createPrediction(userId, matchId, predictedWinnerName)
  
  revalidatePath('/torneio/[id]', 'page')
}
