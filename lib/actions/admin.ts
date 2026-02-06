'use server'

import { getSession } from '@/lib/auth'
import {
  createTournament,
  updateTournamentStatus,
  generateBracket,
  updateMatchPlayers,
  setMatchResult,
  toggleUserAdmin,
  confirmPayment,
} from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.is_admin) {
    redirect('/dashboard')
  }
  return user
}

// ==================== TOURNAMENT ====================

export async function createTournamentAction(formData: FormData) {
  await requireAdmin()

  const name = formData.get('name') as string
  const surface = formData.get('surface') as string
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  if (!name || !surface || !location || !start_date || !end_date) {
    return { success: false, error: 'Todos os campos são obrigatórios' }
  }

  const tournamentId = await createTournament({ name, surface, location, start_date, end_date })
  
  // Auto-generate bracket (127 matches)
  await generateBracket(tournamentId)

  revalidatePath('/admin/torneios')
  revalidatePath('/dashboard')
  redirect(`/admin/torneios/${tournamentId}`)
}

export async function updateTournamentStatusAction(tournamentId: number, status: string) {
  await requireAdmin()
  await updateTournamentStatus(tournamentId, status)
  revalidatePath('/admin/torneios')
  revalidatePath('/torneios')
  revalidatePath('/dashboard')
}

// ==================== BRACKET ====================

export async function generateBracketAction(tournamentId: number) {
  await requireAdmin()
  try {
    await generateBracket(tournamentId)
    revalidatePath(`/admin/torneios/${tournamentId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateMatchPlayersAction(
  matchId: number,
  player1Name: string,
  player2Name: string,
  player1Seed: number | null,
  player2Seed: number | null,
  tournamentId: number
) {
  await requireAdmin()
  await updateMatchPlayers(matchId, player1Name, player2Name, player1Seed, player2Seed)
  revalidatePath(`/admin/torneios/${tournamentId}`)
  revalidatePath(`/torneio/${tournamentId}`)
  return { success: true }
}

export async function setMatchResultAction(
  matchId: number,
  winnerName: string,
  score: string,
  tournamentId: number
) {
  await requireAdmin()
  const result = await setMatchResult(matchId, winnerName, score)

  if (result.success) {
    revalidatePath(`/admin/torneios/${tournamentId}`)
    revalidatePath(`/torneio/${tournamentId}`)
    revalidatePath('/ranking')
    revalidatePath('/dashboard')
  }

  return result
}

// ==================== USERS ====================

export async function toggleUserAdminAction(userId: number, isAdmin: boolean) {
  await requireAdmin()
  await toggleUserAdmin(userId, isAdmin)
  revalidatePath('/admin/usuarios')
}

export async function confirmPaymentAction(userId: number, tournamentId: number) {
  await requireAdmin()
  await confirmPayment(userId, tournamentId)
  revalidatePath(`/admin/torneios/${tournamentId}`)
}
