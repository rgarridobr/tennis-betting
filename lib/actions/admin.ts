'use server'

import { getSession } from '@/lib/auth'
import { createTournament, createMatch, updateMatchResult, updateTournament, toggleUserAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.is_admin) {
    redirect('/dashboard')
  }
  return user
}

export async function createTournamentAction(formData: FormData) {
  await requireAdmin()
  
  const name = formData.get('name') as string
  const surface = formData.get('surface') as string
  const location = formData.get('location') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const status = formData.get('status') as string
  const image_url = formData.get('image_url') as string
  const entry_fee = parseFloat(formData.get('entry_fee') as string)

  if (!name || !surface || !location || !start_date || !end_date || !status || isNaN(entry_fee)) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  await createTournament({
    name,
    surface,
    location,
    start_date,
    end_date,
    status,
    entry_fee,
    image_url: image_url || undefined,
  })

  revalidatePath('/admin/torneios')
  revalidatePath('/dashboard')
  redirect('/admin/torneios')
}

export async function updateTournamentStatusAction(tournamentId: number, status: string) {
  await requireAdmin()
  await updateTournament(tournamentId, { status })
  revalidatePath('/admin/torneios')
  revalidatePath('/dashboard')
}

export async function createMatchAction(formData: FormData) {
  await requireAdmin()

  const tournament_id = parseInt(formData.get('tournament_id') as string, 10)
  const player1_name = formData.get('player1_name') as string
  const player2_name = formData.get('player2_name') as string
  const player1_country = formData.get('player1_country') as string
  const player2_country = formData.get('player2_country') as string
  const round = formData.get('round') as string
  const match_date = formData.get('match_date') as string

  if (!tournament_id || !player1_name || !player2_name || !round || !match_date) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  await createMatch({
    tournament_id,
    player1_name,
    player2_name,
    player1_country: player1_country || '',
    player2_country: player2_country || '',
    round,
    match_date,
  })

  revalidatePath(`/admin/torneios/${tournament_id}`)
  revalidatePath(`/torneio/${tournament_id}`)
}

export async function updateMatchResultAction(formData: FormData) {
  await requireAdmin()

  const matchId = parseInt(formData.get('match_id') as string, 10)
  const winner = parseInt(formData.get('winner') as string, 10)
  const player1Score = formData.get('player1_score') as string
  const player2Score = formData.get('player2_score') as string
  const tournamentId = formData.get('tournament_id') as string

  if (!matchId || !winner || !player1Score || !player2Score) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  await updateMatchResult(matchId, winner, player1Score, player2Score)
  revalidatePath(`/admin/torneios/${tournamentId}`)
  revalidatePath(`/torneio/${tournamentId}`)
  revalidatePath('/ranking')
}

export async function toggleUserAdminAction(userId: number, isAdmin: boolean) {
  await requireAdmin()
  await toggleUserAdmin(userId, isAdmin)
  revalidatePath('/admin/usuarios')
}
