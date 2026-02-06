'use server'

import { getSession } from '@/lib/auth'
import {
  createTournament,
  updateTournamentStatus,
  generateBracket,
  setMatchPlayers,
  setMatchResult,
  createPlayer,
  importPlayers,
  toggleUserAdmin,
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
    return { success: false, error: 'Todos os campos sao obrigatorios' }
  }

  try {
    console.log("[v0] Creating tournament:", { name, surface, location, start_date, end_date })
    const tournamentId = await createTournament({ name, surface, location, start_date, end_date })
    console.log("[v0] Tournament created with id:", tournamentId)
    
    await generateBracket(tournamentId)
    console.log("[v0] Bracket generated for tournament:", tournamentId)

    revalidatePath('/admin/torneios')
    revalidatePath('/dashboard')
    
    return { success: true, tournamentId }
  } catch (error) {
    console.error("[v0] Error creating tournament:", error)
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
  revalidatePath('/admin/torneios')
  return { success: true }
}

export async function importPlayersAction(playersText: string) {
  await requireAdmin()
  // Format: "1. Player Name (Country)\n2. Player Name (Country)"
  const lines = playersText.split('\n').filter(l => l.trim())
  const players: Array<{ name: string; country: string | null; seed: number | null }> = []

  for (const line of lines) {
    const cleaned = line.trim()
    // Try to parse "1. Name (Country)" or just "Name"
    const seedMatch = cleaned.match(/^(\d+)\.\s*/)
    const seed = seedMatch ? parseInt(seedMatch[1], 10) : null
    const withoutSeed = seedMatch ? cleaned.slice(seedMatch[0].length) : cleaned

    const countryMatch = withoutSeed.match(/\(([^)]+)\)\s*$/)
    const country = countryMatch ? countryMatch[1] : null
    const name = countryMatch ? withoutSeed.slice(0, withoutSeed.lastIndexOf('(')).trim() : withoutSeed.trim()

    if (name) {
      players.push({ name, country, seed })
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
