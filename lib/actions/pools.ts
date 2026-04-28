'use server';

import { sql } from '../db';
import { getSession, hashPassword, verifyPassword } from '../auth';
import { revalidatePath } from 'next/cache';

export async function createPoolAction(formData: FormData) {
  const user = await getSession();
  if (!user) throw new Error('Não autorizado');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const password = formData.get('password') as string;
  const isGeneral = user.is_admin && formData.get('is_general') === 'on';
  const tournamentId = formData.get('tournament_id') ? Number(formData.get('tournament_id')) : null;

  if (!name) return { error: 'O nome do bolão é obrigatório' };

  let passwordHash = null;
  if (password) {
    passwordHash = await hashPassword(password);
  }

  try {
    const result = await sql`
      INSERT INTO pools (name, description, creator_id, password_hash, is_general, tournament_id)
      VALUES (${name}, ${description}, ${user.id}, ${passwordHash}, ${isGeneral}, ${tournamentId})
      RETURNING id
    `;

    const poolId = result[0].id;

    // Creator automatically joins the pool
    await sql`
      INSERT INTO pool_members (pool_id, user_id)
      VALUES (${poolId}, ${user.id})
    `;

    revalidatePath('/boloes');
    return { success: true, poolId };
  } catch (error) {
    console.error('Erro ao criar bolão:', error);
    return { error: 'Ocorreu um erro ao criar o bolão' };
  }
}

export async function joinPoolAction(poolId: number, password?: string) {
  const user = await getSession();
  if (!user) throw new Error('Não autorizado');

  try {
    const pool = await sql`SELECT * FROM pools WHERE id = ${poolId}`;
    if (pool.length === 0) return { error: 'Bolão não encontrado' };

    const poolData = pool[0];

    // Check password if private
    if (poolData.password_hash && !user.is_admin) {
      if (!password) return { error: 'Este bolão requer senha', needsPassword: true };
      
      const isValid = await verifyPassword(password, poolData.password_hash);
      if (!isValid) return { error: 'Senha incorreta' };
    }

    await sql`
      INSERT INTO pool_members (pool_id, user_id)
      VALUES (${poolId}, ${user.id})
      ON CONFLICT (pool_id, user_id) DO NOTHING
    `;

    revalidatePath('/boloes');
    revalidatePath(`/boloes/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao entrar no bolão:', error);
    return { error: 'Ocorreu um erro ao entrar no bolão' };
  }
}

export async function leavePoolAction(poolId: number) {
  const user = await getSession();
  if (!user) throw new Error('Não autorizado');

  try {
    await sql`
      DELETE FROM pool_members 
      WHERE pool_id = ${poolId} AND user_id = ${user.id}
    `;

    revalidatePath('/boloes');
    revalidatePath(`/boloes/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao sair do bolão:', error);
    return { error: 'Ocorreu um erro ao sair do bolão' };
  }
}

export async function updatePoolAction(poolId: number, formData: FormData) {
  const user = await getSession();
  if (!user) throw new Error('Não autorizado');

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const password = formData.get('password') as string;
  const tournamentId = formData.get('tournament_id') ? Number(formData.get('tournament_id')) : null;

  if (!name) return { error: 'O nome do bolão é obrigatório' };

  try {
    const pool = await sql`SELECT creator_id, password_hash FROM pools WHERE id = ${poolId}`;
    if (pool.length === 0) return { error: 'Bolão não encontrado' };
    if (pool[0].creator_id !== user.id && !user.is_admin) return { error: 'Não autorizado' };

    let passwordHash = pool[0].password_hash;
    if (password) {
      passwordHash = await hashPassword(password);
    } else if (formData.get('remove_password') === 'true') {
      passwordHash = null;
    }

    await sql`
      UPDATE pools 
      SET name = ${name}, description = ${description}, password_hash = ${passwordHash}, tournament_id = ${tournamentId}
      WHERE id = ${poolId}
    `;

    revalidatePath('/boloes');
    revalidatePath(`/boloes/${poolId}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar bolão:', error);
    return { error: 'Ocorreu um erro ao atualizar o bolão' };
  }
}
