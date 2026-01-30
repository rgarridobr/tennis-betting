'use server'

import { registerUser, loginUser, createSession, destroySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!name || !email || !password) {
    return { error: 'Todos os campos são obrigatórios' }
  }
  
  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' }
  }
  
  try {
    const user = await registerUser(name, email, password)
    await createSession(user.id)
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique')) {
      return { error: 'Este email já está cadastrado' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }
  
  redirect('/dashboard')
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' }
  }
  
  const user = await loginUser(email, password)
  
  if (!user) {
    return { error: 'Email ou senha incorretos' }
  }
  
  await createSession(user.id)
  redirect('/dashboard')
}

export async function logoutAction() {
  await destroySession()
  redirect('/')
}
