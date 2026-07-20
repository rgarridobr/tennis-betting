'use server';

import { getSession, registerUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import {
  fetchAtpDraw,
  findAtpPlayerMatch,
  type ExistingPlayer,
} from '@/lib/services/atp-draw';
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
  toggleTournamentVisibility,
  softDeleteUser,
  updateTournament,
  cancelMatchPoints,
  finishTournament,
} from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireAdmin() {
  const user = await getSession();
  if (!user || !user.is_admin) {
    redirect('/');
  }
  return user;
}

// ==================== TOURNAMENT ====================

export async function createTournamentAction(formData: FormData) {
  const t = await getTranslations('errors');
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
  const prize_description = ((formData.get('prize_description') as string | null) || '').trim();

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
    return { success: false, error: t('adminAllFieldsRequired') };
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
      prize_description: prize_description || null,
    });

    revalidatePath('/admin/torneios');
    revalidatePath('/');

    return { success: true, tournamentId };
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    const message = error.message || t('adminCreateTournamentFailed');
    return { success: false, error: message };
  }
}

export async function updateTournamentPrizeAction(tournamentId: number, prizeDescription: string) {
  const t = await getTranslations('errors');
  await requireAdmin();

  try {
    await updateTournament(tournamentId, {
      prize_description: prizeDescription.trim() || null,
    });
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/torneios');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament prize:', error);
    return { success: false, error: t('adminPrizeUpdateFailed') };
  }
}

export async function updateStartDateTournamentAction(tournamentId: number, newDate: string) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await updateTournament(tournamentId, { start_date: newDate });
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament date:', error);
    return { success: false, error: t('adminDateUpdateFailed') };
  }
}

export async function updateTournamentStatusAction(tournamentId: number, status: string) {
  const t = await getTranslations('errors');
  await requireAdmin();
  await updateTournamentStatus(tournamentId, status);
  revalidatePath('/admin/torneios');
  revalidatePath('/torneios');
  revalidatePath('/');
}

export async function finishTournamentAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const result = await finishTournament(tournamentId);

  if (result.success) {
    revalidatePath('/admin/torneios');
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath('/torneios');
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/');
  }

  return result;
}

export async function deleteTournamentAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const result = await deleteTournament(tournamentId);
  if (result.success) {
    revalidatePath('/admin/torneios');
    revalidatePath('/');
  }
  return result;
}

export async function toggleTournamentVisibilityAction(tournamentId: number, isVisible: boolean) {
  const t = await getTranslations('errors');
  await requireAdmin();
  await toggleTournamentVisibility(tournamentId, isVisible);
  revalidatePath('/admin/torneios');
  revalidatePath(`/admin/torneios/${tournamentId}`);
  revalidatePath('/torneios');
  revalidatePath(`/torneios/${tournamentId}`);
  revalidatePath('/');
  return { success: true };
}

// ==================== PLAYERS ====================

export async function createPlayerAction(formData: FormData) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const name = formData.get('name') as string;
  const country = (formData.get('country') as string) || null;
  const display_name = (formData.get('display_name') as string) || null;
  const seedStr = formData.get('seed') as string;
  const seed = seedStr ? parseInt(seedStr, 10) : null;

  if (!name) return { success: false, error: t('adminNameRequired') };

  await createPlayer(name, country, seed, display_name);
  revalidatePath('/admin/torneios');
  return { success: true };
}

export async function deletePlayerAction(id: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const result = await deletePlayer(id);
  if (result.success) {
    revalidatePath('/admin/torneios');
  }
  return result;
}

export async function updatePlayerAction(id: number, formData: FormData) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const name = formData.get('name') as string;
  const country = (formData.get('country') as string) || null;
  const display_name = (formData.get('display_name') as string) || null;

  if (!name) return { success: false, error: t('adminNameRequired') };

  const result = await updatePlayer(id, name, country, display_name);
  if (result.success) {
    revalidatePath('/admin/torneios');
  }
  return result;
}

export async function importPlayersAction(playersText: string) {
  const t = await getTranslations('errors');
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

  if (players.length === 0) return { success: false, error: t('adminNoPlayersFound') };

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
  const t = await getTranslations('errors');
  await requireAdmin();
  await setMatchPlayers(matchId, player1, player2, tournamentId);
  revalidatePath(`/admin/torneios/${tournamentId}`);
  revalidatePath(`/torneios/${tournamentId}`);
  return { success: true };
}

export async function prepareTournamentAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await prepareTournament(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/admin/torneios');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error preparing tournament:', error);
    return { success: false, error: t('adminPrepareFailed') };
  }
}

export async function resetTournamentToStandbyAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await resetTournamentToStandby(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/admin/torneios');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error resetting tournament:', error);
    return { success: false, error: t('adminResetFailed') };
  }
}

export async function randomizeFirstRoundAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await randomizeFirstRound(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error randomizing first round:', error);
    return { success: false, error: error.message || t('adminRandomizeFailed') };
  }
}

export async function publishTournamentAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await publishTournament(tournamentId);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error publishing tournament:', error);
    return { success: false, error: t('adminPublishFailed') };
  }
}

export async function updatePlaceholderPlayerAction(
  matchId: number,
  slot: 1 | 2,
  playerId: number,
  tournamentId: number,
  isLL?: boolean,
) {
  const t = await getTranslations('errors');
  await requireAdmin();
  await updatePlaceholderPlayer(matchId, slot, playerId, tournamentId, isLL);
  revalidatePath(`/admin/torneios/${tournamentId}`);
  revalidatePath(`/torneios/${tournamentId}`);
  revalidatePath('/ranking');
  revalidatePath('/');
  return { success: true };
}

export async function setMatchResultAction(matchId: number, winnerId: number, score: string, tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const result = await setMatchResult(matchId, winnerId, score);

  if (result.success) {
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/');
  }

  return result;
}

export async function cancelMatchPointsAction(matchId: number, cancelled: boolean, tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  try {
    await cancelMatchPoints(matchId, cancelled);
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error cancelling match points:', error);
    return { success: false, error: t('adminCancelPointsFailed') };
  }
}

export async function clearMatchResultAction(matchId: number, tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  const result = await clearMatchResult(matchId);

  if (result.success) {
    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);
    revalidatePath('/ranking');
    revalidatePath('/');
  }

  return result;
}

// ==================== USERS ====================

export async function createUserAction(formData: FormData) {
  const t = await getTranslations('errors');
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
    return { success: false, error: t('adminRequiredMissing') };
  }

  if (password.length < 6) {
    return { success: false, error: t('passwordMin6') };
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
      return { success: false, error: t('emailTaken') };
    }
    return { success: false, error: t('registerFailed') };
  }
}

export async function updateUserAction(id: number, formData: FormData) {
  const t = await getTranslations('errors');
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
    return { success: false, error: t('adminRequiredMissingShort') };
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
    return { success: false, error: t('adminUserUpdateFailed') };
  }
}

export async function toggleUserStatusAction(userId: number, isActive: boolean) {
  const t = await getTranslations('errors');
  await requireAdmin();
  await toggleUserStatus(userId, isActive);
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function deleteUserAction(userId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();
  await softDeleteUser(userId);
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function createTennisClubAction(formData: FormData) {
  const t = await getTranslations('errors');
  await requireAdmin();

  const name = (formData.get('name') as string | null)?.trim() ?? '';
  if (!name) {
    return { success: false, error: t('adminClubNameRequired') };
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
    return { success: false, error: t('adminClubCreateFailed') };
  }
}

export async function updateTennisClubAction(formData: FormData) {
  const t = await getTranslations('errors');
  await requireAdmin();

  const id = Number((formData.get('id') as string | null)?.trim() ?? '');
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (!id || !name) {
    return { success: false, error: t('adminClubIdNameRequired') };
  }

  try {
    const existingClub = await sql`
      SELECT name FROM tennis_clubs WHERE id = ${id}
    `;
    if (existingClub.length === 0) {
      return { success: false, error: t('adminClubNotFound') };
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
    return { success: false, error: t('adminClubUpdateFailed') };
  }
}

export async function deleteTennisClubAction(formData: FormData) {
  const t = await getTranslations('errors');
  await requireAdmin();

  const id = Number((formData.get('id') as string | null)?.trim() ?? '');
  if (!id) {
    return { success: false, error: t('adminClubIdRequired') };
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
    return { success: false, error: t('adminClubDeleteFailed') };
  }
}

// ==================== ATP DRAW SYNC ====================

function cleanAtpPlayerName(value: string): string {
  return value
    .replace(/\b([A-Z])\s+([a-z]{1,5})\b/g, '$1$2')
    .replace(/\b([A-Z][a-z]+)\s+([A-Z])\s+([a-z]+)\b/g, '$1 $2$3')
    .replace(/\b([A-Za-z]+)\s+It\s+A\s+([A-Za-z]+)\b/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePlayerType(type: string): string {
  if (type === 'WILD_CARD') return 'WILDCARD';
  return type;
}

export async function syncTournamentBracketAction(tournamentId: number) {
  const t = await getTranslations('errors');
  await requireAdmin();

  const tournament = await sql`
    SELECT api_id, year, slug FROM tournaments WHERE id = ${tournamentId}
  `;

  if (tournament.length === 0) {
    return { success: false, error: t('adminTournamentNotFound') };
  }

  const { api_id, year, slug } = tournament[0];

  if (!api_id) {
    return { success: false, error: t('adminAtpApiIdMissing') };
  }

  const atpSlug = slug.replace(new RegExp(`-${year}$`), '');
  const atpDrawUrl = `https://www.atptour.com/en/scores/archive/${atpSlug}/${api_id}/${year}/draws`;

  try {
    console.log(`Syncing ATP bracket for tournament ${tournamentId}: ${atpDrawUrl}`);

    const drawMatches = await fetchAtpDraw(api_id, year, atpSlug);

    if (drawMatches.length === 0) {
      return {
        success: false,
        error: t('adminNoAtpMatches'),
      };
    }

    const ourMatches = await sql`
      SELECT id, position
      FROM bracket_matches
      WHERE tournament_id = ${tournamentId}
        AND round = 1
      ORDER BY position ASC
    `;

    if (ourMatches.length === 0) {
      return { success: false, error: t('adminBracketNotGenerated') };
    }

    const allPlayers = await sql`
      SELECT id, name, display_name, country
      FROM players
    ` as ExistingPlayer[];

    let updatedCount = 0;

    for (let i = 0; i < ourMatches.length; i++) {
      const ourMatch = ourMatches[i];
      const atpMatch = drawMatches[i];

      if (!atpMatch) break;

      const playersToUpdate: Array<{
        id?: number;
        type: string;
        seed: number | null;
      }> = [];

      for (let pIdx = 0; pIdx < 2; pIdx++) {
        const atpPlayer = atpMatch.players[pIdx];

        if (!atpPlayer) {
          playersToUpdate.push({ id: undefined, type: 'PLAYER', seed: null });
          continue;
        }

        if (atpPlayer.type === 'BYE') {
          playersToUpdate.push({ id: undefined, type: 'BYE', seed: null });
          continue;
        }

        let matchedPlayer = findAtpPlayerMatch(
          atpPlayer.name,
          atpPlayer.country,
          allPlayers,
        );

        const cleanedAtpName = cleanAtpPlayerName(atpPlayer.name);

        if (!matchedPlayer && cleanedAtpName !== atpPlayer.name) {
          matchedPlayer = findAtpPlayerMatch(
            cleanedAtpName,
            atpPlayer.country,
            allPlayers,
          );
        }

        let playerId: number;

        if (!matchedPlayer && atpPlayer.name.includes('…')) {
          throw new Error(t('adminTruncatedPlayerName', { name: atpPlayer.name, country: atpPlayer.country || t('adminNoCountry') }));
        }

        if (!matchedPlayer) {
          const createdPlayer = await sql`
            INSERT INTO players (name, country, display_name)
            VALUES (${cleanedAtpName}, ${atpPlayer.country || null}, ${cleanedAtpName})
            RETURNING id
          `;

          playerId = createdPlayer[0].id;
          allPlayers.push({
            id: playerId,
            name: cleanedAtpName,
            display_name: cleanedAtpName,
            country: atpPlayer.country || null,
          });
        } else {
          playerId = matchedPlayer.id;
        }

        if (atpPlayer.country) {
          await sql`
            UPDATE players
            SET country = COALESCE(country, ${atpPlayer.country})
            WHERE id = ${playerId}
          `;
        }

        playersToUpdate.push({
          id: playerId,
          type: normalizePlayerType(atpPlayer.type),
          seed: atpPlayer.seed && !isNaN(parseInt(atpPlayer.seed, 10)) ? parseInt(atpPlayer.seed, 10) : null,
        });
      }

      await setMatchPlayers(ourMatch.id, playersToUpdate[0], playersToUpdate[1], tournamentId);
      updatedCount++;
    }

    revalidatePath(`/admin/torneios/${tournamentId}`);
    revalidatePath(`/torneios/${tournamentId}`);

    return { success: true, updatedCount };
  } catch (error: any) {
    console.error('Error syncing bracket:', error);
    return {
      success: false,
      error: t('adminBracketSyncFailed', { message: error.message }),
    };
  }
}

// ==================== METADATA ====================

export async function createMetadataAction(type: 'name' | 'location', name: string) {
  const t = await getTranslations('errors');
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
  const t = await getTranslations('errors');
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
  const t = await getTranslations('errors');
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
    return { success: false, error: t('adminDeleteInUse') };
  }
}
