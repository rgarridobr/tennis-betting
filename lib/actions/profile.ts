'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { getTranslations } from 'next-intl/server';

export async function updateProfile(formData: FormData) {
  const t = await getTranslations('errors');
  try {
    const user = await getSession();
    if (!user) {
      return { success: false, error: t('unauthorized') };
    }

    const name = formData.get('name') as string;
    const nickname = formData.get('nickname') as string;
    const tennis_club = formData.get('tennis_club') as string;
    const tennis_club_id_raw = (formData.get('tennis_club_id') as string | null)?.trim() ?? '';
    const tennis_club_custom = (formData.get('tennis_club_custom') as string | null)?.trim() ?? '';
    const country = (formData.get('country') as string | null)?.trim() || 'Brasil';
    const state = (formData.get('state') as string | null)?.trim() ?? '';
    const city = (formData.get('city') as string | null)?.trim() ?? '';
    const tennis_club_id = tennis_club_id_raw ? Number(tennis_club_id_raw) : null;
    const isBrazil = ['brasil', 'brazil'].includes(country.trim().toLowerCase());
    const stateValue = isBrazil ? state : '';
    const cityValue = isBrazil ? city : '';

    if (!name || name.trim().length === 0) {
      return { success: false, error: t('nameRequired') };
    }

    if (!tennis_club || tennis_club.trim().length === 0) {
      return { success: false, error: t('clubRequired') };
    }

    if (isBrazil && (!state || !city)) {
      return { success: false, error: t('stateCityBrazil') };
    }

    if (name.trim().length < 2) {
      return { success: false, error: t('nameMin2') };
    }

    // Update user (email cannot be changed)
    await sql`
      UPDATE users 
      SET
        name = ${name.trim()},
        nickname = ${nickname?.trim() || null},
        tennis_club = ${tennis_club.trim()},
        tennis_club_id = ${tennis_club_id},
        tennis_club_custom = ${tennis_club_custom || null},
        country = ${country.trim()},
        state = ${stateValue},
        city = ${cityValue},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    revalidatePath('/perfil');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: t('profileUpdateFailed') };
  }
}

export async function updatePassword(formData: FormData) {
  const t = await getTranslations('errors');
  try {
    const user = await getSession();
    if (!user) {
      return { success: false, error: t('loginRequiredPassword') };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!currentPassword) {
      return { success: false, error: t('currentPasswordRequired') };
    }

    if (!newPassword) {
      return { success: false, error: t('newPasswordRequired') };
    }

    if (newPassword.length < 6) {
      return { success: false, error: t('passwordMin6') };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: t('passwordDifferent') };
    }

    // Get current user with password
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `;

    if (users.length === 0) {
      return { success: false, error: t('userNotFound') };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return { success: false, error: t('currentPasswordWrong') };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    revalidatePath('/perfil');

    return { success: true, message: t('passwordChanged') };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: t('passwordUpdateFailed') };
  }
}
