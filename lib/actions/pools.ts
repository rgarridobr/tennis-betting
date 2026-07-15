'use server';

import { sql } from '../db';
import { getSession, hashPassword, verifyPassword } from '../auth';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

export async function createPoolAction(formData: FormData) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user) throw new Error(t('unauthorized'));

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const password = formData.get('password') as string;
  const isGeneral = user.is_admin && formData.get('is_general') === 'on';
  const hidePending = formData.get('hide_pending') === 'on';
  const tournamentId = formData.get('tournament_id') && formData.get('tournament_id') !== 'all' ? Number(formData.get('tournament_id')) : null;
  const whatsappLink = formData.get('whatsapp_link') as string;

  if (!name) return { error: t('poolNameRequired') };

  let passwordHash = null;
  if (password) {
    passwordHash = await hashPassword(password);
  }

  try {
    const result = await sql`
      INSERT INTO pools (name, description, creator_id, password_hash, is_general, tournament_id, hide_pending, whatsapp_link)
      VALUES (${name}, ${description}, ${user.id}, ${passwordHash}, ${isGeneral}, ${tournamentId}, ${hidePending}, ${whatsappLink})
      RETURNING id
    `;

    const poolId = result[0].id;

    // Creator automatically joins the pool
    await sql`
      INSERT INTO pool_members (pool_id, user_id)
      VALUES (${poolId}, ${user.id})
    `;

    revalidatePath('/grupos');
    return { success: true, poolId };
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return { error: t('poolCreateFailed') };
  }
}

export async function joinPoolAction(poolId: number, password?: string) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user) throw new Error(t('unauthorized'));

  try {
    const pool = await sql`SELECT * FROM pools WHERE id = ${poolId}`;
    if (pool.length === 0) return { error: t('poolNotFound') };

    const poolData = pool[0];

    // Check password if private
    if (poolData.password_hash && !user.is_admin) {
      if (!password) return { error: t('poolPasswordRequired'), needsPassword: true };
      
      const isValid = await verifyPassword(password, poolData.password_hash);
      if (!isValid) return { error: t('poolWrongPassword') };
    }

    await sql`
      INSERT INTO pool_members (pool_id, user_id)
      VALUES (${poolId}, ${user.id})
      ON CONFLICT (pool_id, user_id) DO NOTHING
    `;

    revalidatePath('/grupos');
    revalidatePath(`/grupos/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error);
    return { error: t('poolJoinFailed') };
  }
}

export async function leavePoolAction(poolId: number) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user) throw new Error(t('unauthorized'));

  try {
    await sql`
      DELETE FROM pool_members 
      WHERE pool_id = ${poolId} AND user_id = ${user.id}
    `;

    revalidatePath('/grupos');
    revalidatePath(`/grupos/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao sair do grupo:', error);
    return { error: t('poolLeaveFailed') };
  }
}

export async function updatePoolAction(poolId: number, formData: FormData) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user) throw new Error(t('unauthorized'));

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const password = formData.get('password') as string;
  const hidePending = formData.get('hide_pending') === 'on';
  const tournamentId = formData.get('tournament_id') && formData.get('tournament_id') !== 'all' ? Number(formData.get('tournament_id')) : null;
  const whatsappLink = formData.get('whatsapp_link') as string;

  if (!name) return { error: t('poolNameRequired') };

  try {
    const pool = await sql`SELECT creator_id, password_hash FROM pools WHERE id = ${poolId}`;
    if (pool.length === 0) return { error: t('poolNotFound') };
    if (pool[0].creator_id !== user.id && !user.is_admin) return { error: t('unauthorized') };

    let passwordHash = pool[0].password_hash;
    if (password) {
      passwordHash = await hashPassword(password);
    } else if (formData.get('remove_password') === 'true') {
      passwordHash = null;
    }

    await sql`
      UPDATE pools 
      SET name = ${name}, description = ${description}, password_hash = ${passwordHash}, tournament_id = ${tournamentId}, hide_pending = ${hidePending}, whatsapp_link = ${whatsappLink}
      WHERE id = ${poolId}
    `;

    revalidatePath('/grupos');
    revalidatePath(`/grupos/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return { error: t('poolUpdateFailed') };
  }
}

export async function deletePoolAction(poolId: number) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user || !user.is_admin) throw new Error(t('unauthorized'));

  try {
    await sql`DELETE FROM pool_members WHERE pool_id = ${poolId}`;
    await sql`DELETE FROM pools WHERE id = ${poolId}`;
    revalidatePath('/grupos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    return { error: t('poolDeleteFailed') };
  }
}

export async function getPoolMembersAction(poolId: number) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user || !user.is_admin) throw new Error(t('unauthorized'));
  
  try {
    const rows = await sql`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        pm.joined_at
      FROM pool_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.pool_id = ${poolId}
      ORDER BY pm.joined_at ASC
    `;
    return { success: true, members: rows };
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    return { error: t('genericError') };
  }
}

export async function getPoolMembersWithPredictionsAction(poolId: number, tournamentId: number) {
  const t = await getTranslations('errors');
  const user = await getSession();
  if (!user) throw new Error(t('unauthorized'));
  
  try {
    // Check if user is admin or the creator of the pool
    const pool = await sql`SELECT creator_id FROM pools WHERE id = ${poolId}`;
    if (pool.length === 0) throw new Error(t('poolNotFound'));
    
    const isCreator = pool[0].creator_id === user.id;
    if (!user.is_admin && !isCreator) {
      throw new Error(t('unauthorized'));
    }
    const rows = await sql`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        pm.joined_at,
        EXISTS (
          SELECT 1 FROM predictions p
          JOIN bracket_matches bm ON p.bracket_match_id = bm.id
          WHERE p.user_id = u.id AND bm.tournament_id = ${tournamentId}
        ) as has_predictions
      FROM pool_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.pool_id = ${poolId}
      ORDER BY pm.joined_at ASC
    `;
    return { success: true, members: rows };
  } catch (error) {
    console.error('Erro ao buscar membros com palpites:', error);
    return { error: t('genericError') };
  }
}
