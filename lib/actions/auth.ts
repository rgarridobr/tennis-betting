'use server';

import { registerUser, loginUser, createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export async function registerAction(formData: FormData) {
  const t = await getTranslations('errors');
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
  const isBrazil = ['brasil', 'brazil'].includes(country.trim().toLowerCase());

  if (!name || !email || !password || !tennis_club || (isBrazil && (!state || !city))) {
    return { error: t('requiredFields') };
  }

  if (password.length < 6) {
    return { error: t('passwordMin6') };
  }

  try {
    const user = await registerUser(
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
    await createSession(user.id);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique')) {
      return { error: t('emailTaken') };
    }
    return { error: t('registerFailed') };
  }

  const redirectTo = formData.get('redirectTo') as string;
  if (redirectTo) {
    redirect(redirectTo);
  } else {
    redirect('/dashboard');
  }
}

export async function loginAction(formData: FormData) {
  const t = await getTranslations('errors');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: t('emailPasswordRequired') };
  }

  const user = await loginUser(email, password);

  if (!user) {
    return { error: t('invalidCredentials') };
  }

  if (!user.is_active) {
    return { error: t('accountInactive') };
  }

  await createSession(user.id);
  const redirectTo = formData.get('redirectTo') as string;

  if (redirectTo) {
    redirect(redirectTo);
  } else if (user.is_admin) {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
