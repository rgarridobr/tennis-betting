'use server'

import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Athlete actions
export async function createAthlete(formData: FormData) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  const name = formData.get('name') as string
  const country = formData.get('country') as string
  const seed = formData.get('seed') as string

  if (!name) {
    return { success: false, error: 'Nome do atleta é obrigatório' }
  }

  try {
    await sql`
      INSERT INTO athletes (name, country, seed)
      VALUES (${name}, ${country || null}, ${seed ? Number(seed) : null})
    `
    revalidatePath('/admin/chaveamento')
    return { success: true }
  } catch (error) {
    console.error('Error creating athlete:', error)
    return { success: false, error: 'Erro ao criar atleta' }
  }
}

export async function getAthletes() {
  const athletes = await sql`
    SELECT * FROM athletes ORDER BY seed ASC NULLS LAST, name ASC
  `
  return athletes
}

export async function deleteAthlete(athleteId: number) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await sql`DELETE FROM athletes WHERE id = ${athleteId}`
    revalidatePath('/admin/chaveamento')
    return { success: true }
  } catch (error) {
    console.error('Error deleting athlete:', error)
    return { success: false, error: 'Erro ao excluir atleta' }
  }
}

// Bracket entry actions
export async function getBracketEntries(tournamentId: number) {
  const entries = await sql`
    SELECT 
      be.*,
      a1.name as player1_name,
      a1.country as player1_country,
      a1.seed as player1_seed,
      a2.name as player2_name,
      a2.country as player2_country,
      a2.seed as player2_seed,
      w.name as winner_name
    FROM bracket_entries be
    LEFT JOIN athletes a1 ON be.player1_id = a1.id
    LEFT JOIN athletes a2 ON be.player2_id = a2.id
    LEFT JOIN athletes w ON be.winner_id = w.id
    WHERE be.tournament_id = ${tournamentId}
    ORDER BY be.round ASC, be.position ASC
  `
  return entries
}

export async function createBracketEntry(formData: FormData) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  const tournamentId = Number(formData.get('tournamentId'))
  const round = Number(formData.get('round'))
  const position = Number(formData.get('position'))
  const player1Id = formData.get('player1Id') ? Number(formData.get('player1Id')) : null
  const player2Id = formData.get('player2Id') ? Number(formData.get('player2Id')) : null

  try {
    await sql`
      INSERT INTO bracket_entries (tournament_id, round, position, player1_id, player2_id)
      VALUES (${tournamentId}, ${round}, ${position}, ${player1Id}, ${player2Id})
      ON CONFLICT (tournament_id, round, position) 
      DO UPDATE SET player1_id = ${player1Id}, player2_id = ${player2Id}, updated_at = NOW()
    `
    revalidatePath(`/admin/chaveamento/${tournamentId}`)
    return { success: true }
  } catch (error) {
    console.error('Error creating bracket entry:', error)
    return { success: false, error: 'Erro ao criar entrada no chaveamento' }
  }
}

export async function setMatchWinner(formData: FormData) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  const entryId = Number(formData.get('entryId'))
  const winnerId = Number(formData.get('winnerId'))
  const score = formData.get('score') as string

  try {
    // Get current entry info
    const entries = await sql`
      SELECT * FROM bracket_entries WHERE id = ${entryId}
    `
    
    if (entries.length === 0) {
      return { success: false, error: 'Partida não encontrada' }
    }

    const entry = entries[0]

    // Update winner
    await sql`
      UPDATE bracket_entries 
      SET winner_id = ${winnerId}, score = ${score || null}, updated_at = NOW()
      WHERE id = ${entryId}
    `

    // Auto-advance winner to next round
    const nextRound = entry.round + 1
    const nextPosition = Math.ceil(entry.position / 2)
    const isPlayer1InNext = entry.position % 2 === 1

    // Check if next round entry exists
    const nextEntries = await sql`
      SELECT * FROM bracket_entries 
      WHERE tournament_id = ${entry.tournament_id} 
      AND round = ${nextRound} 
      AND position = ${nextPosition}
    `

    if (nextEntries.length > 0) {
      // Update existing entry
      if (isPlayer1InNext) {
        await sql`
          UPDATE bracket_entries 
          SET player1_id = ${winnerId}, updated_at = NOW()
          WHERE tournament_id = ${entry.tournament_id} 
          AND round = ${nextRound} 
          AND position = ${nextPosition}
        `
      } else {
        await sql`
          UPDATE bracket_entries 
          SET player2_id = ${winnerId}, updated_at = NOW()
          WHERE tournament_id = ${entry.tournament_id} 
          AND round = ${nextRound} 
          AND position = ${nextPosition}
        `
      }
    } else if (nextRound <= 7) {
      // Create new entry for next round
      if (isPlayer1InNext) {
        await sql`
          INSERT INTO bracket_entries (tournament_id, round, position, player1_id)
          VALUES (${entry.tournament_id}, ${nextRound}, ${nextPosition}, ${winnerId})
        `
      } else {
        await sql`
          INSERT INTO bracket_entries (tournament_id, round, position, player2_id)
          VALUES (${entry.tournament_id}, ${nextRound}, ${nextPosition}, ${winnerId})
        `
      }
    }

    revalidatePath(`/admin/chaveamento/${entry.tournament_id}`)
    return { success: true }
  } catch (error) {
    console.error('Error setting winner:', error)
    return { success: false, error: 'Erro ao definir vencedor' }
  }
}

// Initialize bracket with 64 matches for 1st round
export async function initializeBracket(tournamentId: number) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Check if bracket already exists
    const existing = await sql`
      SELECT COUNT(*) as count FROM bracket_entries WHERE tournament_id = ${tournamentId}
    `
    
    if (Number(existing[0].count) > 0) {
      return { success: false, error: 'Chaveamento já inicializado' }
    }

    // Create 64 matches for 1st round
    for (let i = 1; i <= 64; i++) {
      await sql`
        INSERT INTO bracket_entries (tournament_id, round, position)
        VALUES (${tournamentId}, 1, ${i})
      `
    }

    revalidatePath(`/admin/chaveamento/${tournamentId}`)
    return { success: true }
  } catch (error) {
    console.error('Error initializing bracket:', error)
    return { success: false, error: 'Erro ao inicializar chaveamento' }
  }
}

// Bulk add athletes from text (one per line)
export async function bulkAddAthletes(formData: FormData) {
  const user = await getSession()
  if (!user?.is_admin) {
    return { success: false, error: 'Não autorizado' }
  }

  const athletesText = formData.get('athletes') as string
  
  if (!athletesText) {
    return { success: false, error: 'Lista de atletas é obrigatória' }
  }

  const lines = athletesText.split('\n').filter(line => line.trim())
  let added = 0
  let errors = 0

  for (const line of lines) {
    // Format: "Name (Country)" or just "Name"
    const match = line.match(/^(.+?)(?:\s*\(([A-Z]{2,3})\))?(?:\s*\[(\d+)\])?$/)
    if (match) {
      const name = match[1].trim()
      const country = match[2] || null
      const seed = match[3] ? Number(match[3]) : null

      try {
        await sql`
          INSERT INTO athletes (name, country, seed)
          VALUES (${name}, ${country}, ${seed})
          ON CONFLICT DO NOTHING
        `
        added++
      } catch {
        errors++
      }
    }
  }

  revalidatePath('/admin/chaveamento')
  return { success: true, added, errors }
}
