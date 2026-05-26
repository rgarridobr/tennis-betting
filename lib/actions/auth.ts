'use server';

import { registerUser, loginUser, createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const nickname = (formData.get('nickname') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null)?.trim() ?? '';
  const whatsapp = (formData.get('whatsapp') as string | null)?.trim() ?? '';
  const tennis_club = (formData.get('tennis_club') as string | null)?.trim() ?? '';
  const state = (formData.get('state') as string | null)?.trim() ?? '';
  const city = (formData.get('city') as string | null)?.trim() ?? '';

  if (!name || !email || !password || !tennis_club || !state || !city) {
    return { error: 'Todos os campos são obrigatórios' };
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' };
  }

  try {
    const user = await registerUser(name, email, password, whatsapp, tennis_club, nickname, state, city);
    await createSession(user.id);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique')) {
      return { error: 'Este email já está cadastrado' };
    }
    return { error: 'Erro ao criar conta. Tente novamente.' };
  }

  const redirectTo = formData.get('redirectTo') as string;
  if (redirectTo) {
    redirect(redirectTo);
  } else {
    redirect('/dashboard');
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const user = await loginUser(email, password);

  if (!user) {
    return { error: 'Email ou senha incorretos' };
  }

  if (!user.is_active) {
    return { error: 'Sua conta está inativa. Entre em contato com o administrador.' };
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
