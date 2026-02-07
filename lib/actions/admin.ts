'use server'

import { getSession } from '@/lib/auth'
import {
  createTournament,
  updateTournamentStatus,
  generateBracket,
  setMatchPlayers,
  setMatchResult,
  createPlayer,
  deletePlayer,
  updatePlayer,
  importPlayers,
  toggleUserAdmin,
  createTournamentName,
  updateTournamentName,
  deleteTournamentName,
  createTournamentLocation,
  updateTournamentLocation,
  deleteTournamentLocation,
  publishTournament,
  updatePlaceholderPlayer,
  deleteTournament,
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
  const category = formData.get('category') as string
  const category_custom = formData.get('category_custom') as string
  const format = formData.get('format') as string
  const sets_format = parseInt(formData.get('sets_format') as string, 10)
  const size = parseInt(formData.get('size') as string, 10)

  const has_seeds = formData.get('has_seeds') === 'true'
  const has_qualifiers = formData.get('has_qualifiers') === 'true'
  const has_wildcards = formData.get('has_wildcards') === 'true'
  const has_byes = formData.get('has_byes') === 'true'

  if (!name || !surface || !location || !start_date || !end_date || !category || !format || isNaN(sets_format) || isNaN(size)) {
    return { success: false, error: 'Todos os campos sao obrigatorios' }
  }

  try {
    const tournamentId = await createTournament({
      name, surface, location, start_date, end_date,
      category, category_custom, format, sets_format, size,
      has_seeds, has_qualifiers, has_wildcards, has_byes
    })
    await generateBracket(tournamentId)

    revalidatePath('/admin/torneios')
    revalidatePath('/dashboard')
    
    return { success: true, tournamentId }
  } catch (error) {
    console.error("Error creating tournament:", error)
    return { success: false, error: 'Erro ao criar torneio. Tente novamente.' }
  }
}

export async function updateTournamentStatusAction(tournamentId: number, status: string) {
  await requireAdmin()
  await updateTournamentStatus(tournamentId, status)
  revalidatePath('/admin/torneios')
  revalidatePath('/torneios')
  revalidatePath('/dashboard')
}

export async function deleteTournamentAction(tournamentId: number) {
  await requireAdmin()
  const result = await deleteTournament(tournamentId)
  if (result.success) {
    revalidatePath('/admin/torneios')
    revalidatePath('/dashboard')
  }
  return result
}

// ==================== PLAYERS ====================

export async function createPlayerAction(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const country = (formData.get('country') as string) || null
  const seedStr = formData.get('seed') as string
  const seed = seedStr ? parseInt(seedStr, 10) : null

  if (!name) return { success: false, error: 'Nome obrigatorio' }

  await createPlayer(name, country, seed)
  revalidatePath('/admin/torneios')
  return { success: true }
}

export async function deletePlayerAction(id: number) {
  await requireAdmin()
  const result = await deletePlayer(id)
  if (result.success) {
    revalidatePath('/admin/torneios')
  }
  return result
}

export async function updatePlayerAction(id: number, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const country = (formData.get('country') as string) || null

  if (!name) return { success: false, error: 'Nome obrigatorio' }

  const result = await updatePlayer(id, name, country)
  if (result.success) {
    revalidatePath('/admin/torneios')
  }
  return result
}

export async function importPlayersAction(playersText: string) {
  await requireAdmin()
  const lines = playersText.split('\n').filter(l => l.trim())
  const players: Array<{ name: string; country: string | null; seed: number | null }> = []

  for (const line of lines) {
    const cleaned = line.trim()
    // Remove leading numbers like "1. " or "1) "
    const withoutNumber = cleaned.replace(/^(\d+)[.)]\s*/, '')

    const countryMatch = withoutNumber.match(/\(([^)]+)\)\s*$/)
    const country = countryMatch ? countryMatch[1] : null
    const name = countryMatch ? withoutNumber.slice(0, withoutNumber.lastIndexOf('(')).trim() : withoutNumber.trim()

    if (name) {
      players.push({ name, country, seed: null })
    }
  }

  if (players.length === 0) return { success: false, error: 'Nenhum jogador encontrado' }

  const count = await importPlayers(players)
  revalidatePath('/admin/torneios')
  return { success: true, count }
}

// ==================== BRACKET ====================

export async function setMatchPlayersAction(
  matchId: number,
  player1: { id?: number; type: string; seed?: number | null },
  player2: { id?: number; type: string; seed?: number | null },
  tournamentId: number
) {
  await requireAdmin()
  await setMatchPlayers(matchId, player1, player2)
  revalidatePath(`/admin/torneios/${tournamentId}`)
  revalidatePath(`/torneio/${tournamentId}`)
  return { success: true }
}

export async function publishTournamentAction(tournamentId: number) {
  await requireAdmin()
  try {
    await publishTournament(tournamentId)
    revalidatePath(`/admin/torneios/${tournamentId}`)
    revalidatePath(`/torneio/${tournamentId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error("Error publishing tournament:", error)
    return { success: false, error: 'Erro ao publicar torneio' }
  }
}

export async function updatePlaceholderPlayerAction(
  matchId: number,
  slot: 1 | 2,
  playerId: number,
  tournamentId: number
) {
  await requireAdmin()
  await updatePlaceholderPlayer(matchId, slot, playerId)
  revalidatePath(`/admin/torneios/${tournamentId}`)
  revalidatePath(`/torneio/${tournamentId}`)
  return { success: true }
}

export async function setMatchResultAction(
  matchId: number,
  winnerId: number,
  score: string,
  tournamentId: number
) {
  await requireAdmin()
  const result = await setMatchResult(matchId, winnerId, score)

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

// ==================== METADATA ====================

export async function createMetadataAction(type: 'name' | 'location', name: string) {
  await requireAdmin()
  if (type === 'name') {
    await createTournamentName(name)
  } else {
    await createTournamentLocation(name)
  }
  revalidatePath('/admin/torneios/novo')
  return { success: true }
}

export async function updateMetadataAction(type: 'name' | 'location', id: number, name: string) {
  await requireAdmin()
  if (type === 'name') {
    await updateTournamentName(id, name)
  } else {
    await updateTournamentLocation(id, name)
  }
  revalidatePath('/admin/torneios/novo')
  return { success: true }
}

export async function deleteMetadataAction(type: 'name' | 'location', id: number) {
  await requireAdmin()
  try {
    if (type === 'name') {
      await deleteTournamentName(id)
    } else {
      await deleteTournamentLocation(id)
    }
    revalidatePath('/admin/torneios/novo')
    return { success: true }
  } catch (error) {
    console.error("Error deleting metadata:", error)
    return { success: false, error: 'Erro ao excluir. O item pode estar em uso.' }
  }
}
