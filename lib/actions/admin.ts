'use server';

import { getSession, registerUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { fetchAtpDraw } from '@/lib/services/atp-draw';
import {
  createTournament,
  updateTournamentStatus,
  generateBracket,
  setMatchPlayers,
  setMatchResult,
  clearMatchResult,
  createPlayer,
  deletePlayer,
  updatePlayer,
  importPlayers,
  createTournamentName,
  updateTournamentName,
  deleteTournamentName,
  createTournamentLocation,
  updateTournamentLocation,
  deleteTournamentLocation,
  publishTournament,
  prepareTournament,
  resetTournamentToStandby,
  randomizeFirstRound,
  updatePlaceholderPlayer,
  deleteTournament,
  updateUser,
  toggleUserStatus,
  softDeleteUser,
  updateTournament,
  cancelMatchPoints,
} from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireAdmin() {
  const user = await getSession();
  if (!user || !user.is_admin) {
    redirect('/dashboard');
  }
  return user;
}

// ==================== TOURNAMENT ====================

export async function createTournamentAction(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const status = formData.get('status') as string;
  const surface = formData.get('surface') as string;
  const location = formData.get('location') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const category = formData.get('category') as string;
  const category_custom = formData.get('category_custom') as string;
  const format = formData.get('format') as string;
  const sets_format = parseInt(formData.get('sets_format') as string, 10);
  const size = parseInt(formData.get('size') as string, 10);

  const has_seeds = formData.get('has_seeds') === 'true';
  const has_qualifiers = formData.get('has_qualifiers') === 'true';
  const has_wildcards = formData.get('has_wildcards') === 'true';
  const has_byes = formData.get('has_byes') === 'true';
  const image_url = formData.get('image_url') as string;

  if (
    !name ||
    !surface ||
    !location ||
    !start_date ||
    !end_date ||
    !category ||
    !format ||
    isNaN(sets_format) ||
    isNaN(size)
  ) {
    return { success: false, error: 'Todos os campos são obrigatórios' };
  }

  try {
    const tournamentId = await createTournament({
      name,
      surface,
      location,
      start_date,
      end_date,
      category,
      category_custom,
      format,
      sets_format,
      size,
      has_seeds,
      has_qualifiers,
      has_wildcards,
      has_byes,
      status: status || 'STANDBY',
      image_url,
    });

    revalidatePath('/admin/torneios');
    revalidatePath('/dashboard');

    return { success: true, tournamentId };
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    const message = error.message || 'Erro ao criar torneio. Tente novamente.';
    return { success: false, error: message };
  }
}

export async function updateStartDateTournamentAction(tournamentId: number, newDate: string) {
  await requireAdmin();
  try {
    await updateTournament(tournamentId, { start_date: newDate });
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament date:', error);
    return { success: false, error: 'Erro ao atualizar a data do torneio' };
  }
}

export async function updateTournamentStatusAction(tournamentId: number, status: string) {
  await requireAdmin();
  await updateTournamentStatus(tournamentId, status);
  revalidatePath('/admin/torneios');
  revalidatePath('/torneios');
  revalidatePath('/dashboard');
}

export async function deleteTournamentAction(tournamentId: number) {
  await requireAdmin();
  const result = await deleteTournament(tournamentId);
  if (result.success) {
    revalidatePath('/admin/torneios');
    revalidatePath('/dashboard');
  }
  return result;
}

// ==================== PLAYERS ====================

export async function createPlayerAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  const country = (formData.get('country') as string) || null;
  const display_name = (formData.get('display_name') as string) || null;
  const seedStr = formData.get('seed') as string;
  const seed = seedStr ? parseInt(seedStr, 10) : null;

  if (!name) return { success: false, error: 'Nome obrigatório' };

  await createPlayer(name, country, seed, display_name);
  revalidatePath('/admin/torneios');
  return { success: true };
}

export async function deletePlayerAction(id: number) {
  await requireAdmin();
  const result = await deletePlayer(id);
  if (result.success) {
    revalidatePath('/admin/torneios');
  }
  return result;
}

export async function updatePlayerAction(id: number, formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  const country = (formData.get('country') as string) || null;
  const display_name = (formData.get('display_name') as string) || null;

  if (!name) return { success: false, error: 'Nome obrigatório' };

  const result = await updatePlayer(id, name, country, display_name);
  if (result.success) {
    revalidatePath('/admin/torneios');
  }
  return result;
}

export async function importPlayersAction(playersText: string) {
  await requireAdmin();
  const lines = playersText.split('\n').filter((l) => l.trim());
  const players: Array<{ name: string; country: string | null; seed: number | null; display_name: string | null }> = [];

  for (const line of lines) {
    const cleaned = line.trim();
    // Remove leading numbers like "1. " or "1) "
    const withoutNumber = cleaned.replace(/^(\d+)[.)]\s*/, '');

    // Extract country: (ESP)
    const countryMatch = withoutNumber.match(/\(([^)]+)\)/);
    const country = countryMatch ? countryMatch[1] : null;

    // Extract display name: [Car. Alcaraz]
    const displayNameMatch = withoutNumber.match(/\[([^\]]+)\]/);
    const display_name = displayNameMatch ? displayNameMatch[1] : null;

    // Extract name: Everything before first metadata marker
    let name = withoutNumber;
    if (countryMatch || displayNameMatch) {
      const countryIdx = countryMatch?.index ?? Infinity;
      const displayIdx = displayNameMatch?.index ?? Infinity;
      name = withoutNumber.slice(0, Math.min(countryIdx, displayIdx)).trim();
    } else {
      name = withoutNumber.trim();
    }

    if (name) {
      players.push({ name, country, seed: null, display_name });
    }
  }

  if (players.length === 0) return { success: false, error: 'Nenhum jogador encontrado' };

  const count = await importPlayers(players);
  revalidatePath('/admin/torneios');
  return { success: true, count };
}

// ==================== BRACKET ====================

export async function setMatchPlayersAction(
  matchId: number,
  player1: { id?: number; type: string; seed?: number | null },
  player2: { id?: number; type: string; seed?: number | null },
  tournamentId: number,
) {
  await requireAdmin();
  await setMatchPlayers(matchId, player1, player2, tournamentId);
  revalidatePath(`/admin/torneios/${tournamentId}`);
  revalidatePath(`/torneios/${tournamentId}`);
  return { success: true };
}

export async function prepareTournamentAction(tournamentId: number) {
  await requireAdmin();
  try {
    await prepareTournament(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/admin/torneios');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error preparing tournament:', error);
    return { success: false, error: 'Erro ao preparar torneio' };
  }
}

export async function resetTournamentToStandbyAction(tournamentId: number) {
  await requireAdmin();
  try {
    await resetTournamentToStandby(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/admin/torneios');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error resetting tournament:', error);
    return { success: false, error: 'Erro ao resetar torneio' };
  }
}

export async function randomizeFirstRoundAction(tournamentId: number) {
  await requireAdmin();
  try {
    await randomizeFirstRound(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error randomizing first round:', error);
    return { success: false, error: error.message || 'Erro ao gerar chaves aleatórias' };
  }
}

export async function publishTournamentAction(tournamentId: number) {
  await requireAdmin();
  try {
    await publishTournament(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error publishing tournament:', error);
    return { success: false, error: 'Erro ao publicar torneio' };
  }
}

export async function updatePlaceholderPlayerAction(
  matchId: number,
  slot: 1 | 2,
  playerId: number,
  tournamentId: number,
  isLL?: boolean,
) {
  await requireAdmin();
  await updatePlaceholderPlayer(matchId, slot, playerId, tournamentId, isLL);
  revalidatePath(`/admin/torneios/${tournamentId}`);
  revalidatePath(`/torneios/${tournamentId}`);
  revalidatePath('/ranking');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function setMatchResultAction(matchId: number, winnerId: number, score: string, tournamentId: number) {
  await requireAdmin();
  const result = await setMatchResult(matchId, winnerId, score);

  if (result.success) {
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/dashboard');
  }

  return result;
}

export async function cancelMatchPointsAction(matchId: number, cancelled: boolean, tournamentId: number) {
  await requireAdmin();
  try {
    await cancelMatchPoints(matchId, cancelled);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error cancelling match points:', error);
    return { success: false, error: 'Erro ao cancelar pontuação' };
  }
}

export async function clearMatchResultAction(matchId: number, tournamentId: number) {
  await requireAdmin();
  const result = await clearMatchResult(matchId);

  if (result.success) {
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/dashboard');
  }

  return result;
}

// ==================== USERS ====================

export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const nickname = (formData.get('nickname') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null)?.trim() ?? '';
  const whatsapp = (formData.get('whatsapp') as string | null)?.trim() ?? '';
  const tennis_club = (formData.get('tennis_club') as string | null)?.trim() ?? '';
  const tennis_club_id_raw = (formData.get('tennis_club_id') as string | null)?.trim() ?? '';
  const tennis_club_custom = (formData.get('tennis_club_custom') as string | null)?.trim() ?? '';
  const country = (formData.get('country') as string | null)?.trim() || 'Brasil';
  const state = (formData.get('state') as string | null)?.trim() ?? '';
  const city = (formData.get('city') as string | null)?.trim() ?? '';
  const tennis_club_id = tennis_club_id_raw ? Number(tennis_club_id_raw) : null;
  const isBrazil = ['brasil', 'brazil'].includes(country.toLowerCase());

  if (!name || !email || !password || !tennis_club || !country || (isBrazil && (!state || !city))) {
    return { success: false, error: 'Todos os campos obrigatórios estão faltando' };
  }

  if (password.length < 6) {
    return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
  }

  try {
    await registerUser(
      name,
      email,
      password,
      country,
      state,
      city,
      whatsapp,
      tennis_club,
      nickname,
      tennis_club_id,
      tennis_club_custom || null,
    );
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.message?.includes('unique') || error.code === '23505') {
      return { success: false, error: 'Este email já está cadastrado' };
    }
    return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
  }
}

export async function updateUserAction(id: number, formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const nickname = (formData.get('nickname') as string | null)?.trim() ?? '';
  const whatsapp = (formData.get('whatsapp') as string | null)?.trim() ?? '';
  const tennis_club = (formData.get('tennis_club') as string | null)?.trim() ?? '';
  const tennis_club_id_raw = (formData.get('tennis_club_id') as string | null)?.trim() ?? '';
  const tennis_club_custom = (formData.get('tennis_club_custom') as string | null)?.trim() ?? '';
  const country = (formData.get('country') as string | null)?.trim() || 'Brasil';
  const state = (formData.get('state') as string | null)?.trim() ?? '';
  const city = (formData.get('city') as string | null)?.trim() ?? '';
  const tennis_club_id = tennis_club_id_raw ? Number(tennis_club_id_raw) : null;
  const isBrazil = ['brasil', 'brazil'].includes(country.toLowerCase());

  if (!name || !email || !tennis_club || !country || (isBrazil && (!state || !city))) {
    return { success: false, error: 'Campos obrigatórios estão faltando' };
  }

  try {
    await updateUser(id, {
      name,
      email,
      nickname,
      whatsapp,
      tennis_club,
      tennis_club_id,
      tennis_club_custom: tennis_club_custom || null,
      country,
      state: isBrazil ? state : '',
      city: isBrazil ? city : '',
    });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Erro ao atualizar usuário' };
  }
}

export async function toggleUserStatusAction(userId: number, isActive: boolean) {
  await requireAdmin();
  await toggleUserStatus(userId, isActive);
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function deleteUserAction(userId: number) {
  await requireAdmin();
  await softDeleteUser(userId);
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function createTennisClubAction(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  if (!name) {
    return { success: false, error: 'Nome do clube Ã© obrigatÃ³rio' };
  }

  try {
    await sql`
      INSERT INTO tennis_clubs (name)
      VALUES (${name})
      ON CONFLICT (name) DO NOTHING
    `;
    revalidatePath('/admin/usuarios');
    revalidatePath('/admin/clubes');
    revalidatePath('/cadastro');
    revalidatePath('/perfil');
    return { success: true };
  } catch (error) {
    console.error('Error creating tennis club:', error);
    return { success: false, error: 'Erro ao cadastrar clube' };
  }
}

export async function updateTennisClubAction(formData: FormData) {
  await requireAdmin();

  const id = Number((formData.get('id') as string | null)?.trim() ?? '');
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (!id || !name) {
    return { success: false, error: 'ID e nome do clube são obrigatórios' };
  }

  try {
    const existingClub = await sql`
      SELECT name FROM tennis_clubs WHERE id = ${id}
    `;
    if (existingClub.length === 0) {
      return { success: false, error: 'Clube não encontrado' };
    }

    const oldName = existingClub[0].name;

    await sql`
      UPDATE tennis_clubs
      SET name = ${name}
      WHERE id = ${id}
    `;

    await sql`
      UPDATE users
      SET tennis_club = ${name}
      WHERE tennis_club_id = ${id}
        OR tennis_club = ${oldName}
    `;

    revalidatePath('/admin/usuarios');
    revalidatePath('/admin/clubes');
    revalidatePath('/cadastro');
    revalidatePath('/perfil');
    return { success: true };
  } catch (error) {
    console.error('Error updating tennis club:', error);
    return { success: false, error: 'Erro ao atualizar clube' };
  }
}

export async function deleteTennisClubAction(formData: FormData) {
  await requireAdmin();

  const id = Number((formData.get('id') as string | null)?.trim() ?? '');
  if (!id) {
    return { success: false, error: 'ID do clube é obrigatório' };
  }

  try {
    await sql`
      UPDATE users
      SET tennis_club_id = NULL
      WHERE tennis_club_id = ${id}
    `;

    await sql`
      DELETE FROM tennis_clubs
      WHERE id = ${id}
    `;

    revalidatePath('/admin/usuarios');
    revalidatePath('/admin/clubes');
    revalidatePath('/cadastro');
    revalidatePath('/perfil');
    return { success: true };
  } catch (error) {
    console.error('Error deleting tennis club:', error);
    return { success: false, error: 'Erro ao excluir clube' };
  }
}

// ==================== ATP DRAW SYNC ====================

function extractFullNameFromHref(href: string | null, fallback: string): string {
  if (!href) return fallback;
  const parts = href.split('/');
  const playersIdx = parts.indexOf('players');
  if (playersIdx === -1 || playersIdx >= parts.length - 1) return fallback;

  const slug = parts[playersIdx + 1]; // e.g. carlos-alcaraz
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export async function syncTournamentBracketAction(tournamentId: number) {
  await requireAdmin();

  const tournament = await sql`
    SELECT api_id, year, slug FROM tournaments WHERE id = ${tournamentId}
  `;

  if (tournament.length === 0) {
    return { success: false, error: 'Torneio não encontrado' };
  }

  const { api_id, year, slug } = tournament[0];

  if (!api_id) {
    return { success: false, error: 'ID da API ATP não configurado para este torneio' };
  }

  // Remove o ano do final do slug para obter o slug da ATP (ex: basel-2024 -> basel, roland-garros-2024 -> roland-garros)
  const atpSlug = slug.replace(new RegExp(`-${year}$`), '');

  try {
    const drawMatches = await fetchAtpDraw(api_id, year, atpSlug);

    if (drawMatches.length === 0) {
      return { success: false, error: 'Nenhuma partida encontrada no chaveamento da ATP' };
    }

    // Buscar partidas da primeira rodada do nosso banco
    const ourMatches = await sql`
      SELECT id, position FROM bracket_matches 
      WHERE tournament_id = ${tournamentId} AND round = 1
      ORDER BY position ASC
    `;

    if (ourMatches.length === 0) {
      return { success: false, error: 'Chaveamento ainda não foi gerado no sistema' };
    }

    let updatedCount = 0;

    // Mapear cada partida da ATP para a nossa partida correspondente na Rodada 1
    // drawMatches costumam ser retornadas na ordem de exibição (topo para baixo)
    for (let i = 0; i < ourMatches.length; i++) {
      const ourMatch = ourMatches[i];
      const atpMatch = drawMatches[i];

      if (!atpMatch) break;

      const playersToUpdate = [];

      for (let pIdx = 0; pIdx < 2; pIdx++) {
        const atpPlayer = atpMatch.players[pIdx];
        if (!atpPlayer) {
          playersToUpdate.push({ id: null, type: 'PLAYER', seed: null });
          continue;
        }

        if (atpPlayer.type === 'BYE') {
          playersToUpdate.push({ id: null, type: 'BYE', seed: null });
          continue;
        }

        // Detect qualifier placeholders: names like "Qualifier", "Qualifier1", "Qualifier Qualifier2",
        // "Q. Qualifier10", or any name containing "qualifier" as it comes from ATP placeholder slots
        const nameIsQualifier =
          /qualifier/i.test(atpPlayer.name?.trim() || '') ||
          /qualifier/i.test(extractFullNameFromHref(atpPlayer.href, ''));
        if (atpPlayer.type === 'QUALIFIER' || nameIsQualifier) {
          playersToUpdate.push({ id: null, type: 'QUALIFIER', seed: null });
          continue;
        }

        // Tentar encontrar ou criar o jogador no banco
        const fullName = extractFullNameFromHref(atpPlayer.href, atpPlayer.name);
        const displayName = atpPlayer.name;

        // Matching logic improvement:
        // 1. Try full name match (slug-based)
        // 2. Try display name match
        // 3. Try partial matches for common patterns (e.g., "Z. Zhang" matches "Zhizhen Zhang")
        let playerRecord = await sql`
          SELECT id, name, display_name FROM players 
          WHERE name ILIKE ${fullName} 
             OR display_name ILIKE ${displayName}
             OR name ILIKE ${displayName}
             OR display_name ILIKE ${fullName}
        `;

        // If no direct match, try a more relaxed search for short names like "Z. Zhang"
        if (playerRecord.length === 0 && displayName.includes('. ')) {
          const [initial, lastName] = displayName.split('. ');
          if (lastName) {
            const searchPattern = `${initial.charAt(0)}% ${lastName}`;
            playerRecord = await sql`
              SELECT id, name, display_name FROM players 
              WHERE name ILIKE ${searchPattern} OR display_name ILIKE ${searchPattern}
            `;
          }
        }

        let playerId: number;
        if (playerRecord.length === 0) {
          const newPlayer = await sql`
            INSERT INTO players (name, country, display_name)
            VALUES (${fullName}, ${atpPlayer.country || null}, ${displayName})
            RETURNING id
          `;
          playerId = newPlayer[0].id;
        } else {
          playerId = playerRecord[0].id;
          // Update country and always update display_name to reflect current seed structure
          if (atpPlayer.country || displayName) {
            await sql`
              UPDATE players 
              SET 
                country = COALESCE(country, ${atpPlayer.country || null}),
                display_name = ${displayName}
              WHERE id = ${playerId}
            `;
          }
        }

        playersToUpdate.push({
          id: playerId,
          type: atpPlayer.type,
          seed: atpPlayer.seed && !isNaN(parseInt(atpPlayer.seed, 10)) ? parseInt(atpPlayer.seed, 10) : null,
        });
      }

      // Atualizar a partida no banco
      await setMatchPlayers(ourMatch.id, playersToUpdate[0], playersToUpdate[1], tournamentId);
      updatedCount++;
    }

    revalidatePath(`/admin/torneios/${tournamentId}`);
    return { success: true, updatedCount };
  } catch (error: any) {
    console.error('Error syncing bracket:', error);
    return { success: false, error: 'Erro ao sincronizar chaveamento: ' + error.message };
  }
}

// ==================== METADATA ====================

export async function createMetadataAction(type: 'name' | 'location', name: string) {
  await requireAdmin();
  if (type === 'name') {
    await createTournamentName(name);
  } else {
    await createTournamentLocation(name);
  }
  revalidatePath('/admin/torneios/novo');
  return { success: true };
}

export async function updateMetadataAction(type: 'name' | 'location', id: number, name: string) {
  await requireAdmin();
  if (type === 'name') {
    await updateTournamentName(id, name);
  } else {
    await updateTournamentLocation(id, name);
  }
  revalidatePath('/admin/torneios/novo');
  return { success: true };
}

export async function deleteMetadataAction(type: 'name' | 'location', id: number) {
  await requireAdmin();
  try {
    if (type === 'name') {
      await deleteTournamentName(id);
    } else {
      await deleteTournamentLocation(id);
    }
    revalidatePath('/admin/torneios/novo');
    return { success: true };
  } catch (error) {
    console.error('Error deleting metadata:', error);
    return { success: false, error: 'Erro ao excluir. O item pode estar em uso.' };
  }
}
