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
  registerPlayerForTournament,
  removePlayerFromTournament,
} from '@/lib/admin'
import { generateATPDraw } from '@/lib/draw'
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
  const type = formData.get('type') as string
  const bracket_size = parseInt(formData.get('bracket_size') as string, 10)
  const seeds_count = parseInt(formData.get('seeds_count') as string, 10)
  const byes_count = parseInt(formData.get('byes_count') as string, 10)
  const direct_entries_count = parseInt(formData.get('direct_entries_count') as string, 10)
  const qualifiers_count = parseInt(formData.get('qualifiers_count') as string, 10)
  const wildcards_count = parseInt(formData.get('wildcards_count') as string, 10)

  if (!name || !surface || !location || !start_date || !end_date || !type || isNaN(bracket_size)) {
    return { success: false, error: 'Todos os campos sao obrigatorios' }
  }

  try {
    const tournamentId = await createTournament({
      name, surface, location, start_date, end_date,
      type, bracket_size, seeds_count, byes_count,
      direct_entries_count, qualifiers_count, wildcards_count
    })
    // We don't generate the bracket yet, because it needs players and draw generation
    // await generateBracket(tournamentId)

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

// ==================== PLAYERS ====================

export async function createPlayerAction(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const country = (formData.get('country') as string) || null
  const seedStr = formData.get('seed') as string
  const seed = seedStr ? parseInt(seedStr, 10) : null

  if (!name) return { success: false, error: 'Nome obrigatorio' }

  await createPlayer(name, country, seed)
  revalidatePath('/admin/torneios', 'layout')
  return { success: true }
}

export async function deletePlayerAction(id: number) {
  await requireAdmin()
  const result = await deletePlayer(id)
  if (result.success) {
    revalidatePath('/admin/torneios', 'layout')
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
    revalidatePath('/admin/torneios', 'layout')
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
  revalidatePath('/admin/torneios', 'layout')
  return { success: true, count }
}

// ==================== BRACKET ====================

export async function setMatchPlayersAction(
  matchId: number,
  player1Id: number,
  player2Id: number,
  tournamentId: number
) {
  await requireAdmin()
  await setMatchPlayers(matchId, player1Id, player2Id)
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

// ==================== TOURNAMENT REGISTRATION ====================

export async function registerPlayerAction(data: {
  tournamentId: number
  playerId: number
  entryType: string
  rankingAtCutoff?: number
  pointsAtCutoff?: number
}) {
  await requireAdmin()
  await registerPlayerForTournament(data)
  revalidatePath(`/admin/torneios/${data.tournamentId}`)
  return { success: true }
}

export async function removePlayerEntryAction(tournamentId: number, playerId: number) {
  await requireAdmin()
  await removePlayerFromTournament(tournamentId, playerId)
  revalidatePath(`/admin/torneios/${tournamentId}`)
  return { success: true }
}

export async function generateDrawAction(tournamentId: number, randomSeed: string) {
  await requireAdmin()
  try {
    await generateATPDraw(tournamentId, randomSeed)
    revalidatePath(`/admin/torneios/${tournamentId}`)
    revalidatePath(`/torneio/${tournamentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error generating draw:", error)
    return { success: false, error: error.message || 'Erro ao gerar chaveamento' }
  }
}

export async function replacePlayerInDrawAction(tournamentId: number, oldPlayerId: number, newPlayerId: number) {
  await requireAdmin()
  try {
    const { replacePlayerInDraw } = await import('@/lib/admin')
    await replacePlayerInDraw(tournamentId, oldPlayerId, newPlayerId)
    revalidatePath(`/admin/torneios/${tournamentId}`)
    revalidatePath(`/torneio/${tournamentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error replacing player:", error)
    return { success: false, error: error.message || 'Erro ao substituir jogador' }
  }
}
