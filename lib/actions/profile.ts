'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function updateProfile(formData: FormData) {
  try {
    const user = await getSession()
    if (!user) {
      return { success: false, error: 'Não autorizado' }
    }

    const name = formData.get('name') as string
    const nickname = formData.get('nickname') as string
    const tennis_club = formData.get('tennis_club') as string

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Nome é obrigatório' }
    }

    if (!tennis_club || tennis_club.trim().length === 0) {
      return { success: false, error: 'Clube em que joga tênis é obrigatório' }
    }

    if (name.trim().length < 2) {
      return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' }
    }

    // Update user (email cannot be changed)
    await sql`
      UPDATE users 
      SET name = ${name.trim()}, nickname = ${nickname?.trim() || null}, tennis_club = ${tennis_club.trim()}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    revalidatePath('/perfil')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const user = await getSession()
    if (!user) {
      return { success: false, error: 'Você precisa estar logado para alterar a senha' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword) {
      return { success: false, error: 'Digite sua senha atual' }
    }

    if (!newPassword) {
      return { success: false, error: 'Digite a nova senha' }
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' }
    }

    if (currentPassword === newPassword) {
      return { success: false, error: 'A nova senha deve ser diferente da atual' }
    }

    // Get current user with password
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `

    if (users.length === 0) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash)
    if (!isValid) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    revalidatePath('/perfil')
    
    return { success: true, message: 'Senha alterada com sucesso!' }
  } catch (error) {
    console.error('Error updating password:', error)
    return { success: false, error: 'Erro interno ao atualizar senha. Tente novamente.' }
  }
}
