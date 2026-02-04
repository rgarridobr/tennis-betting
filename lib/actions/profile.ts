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
    const email = formData.get('email') as string

    if (!name || !email) {
      return { success: false, error: 'Nome e email são obrigatórios' }
    }

    // Check if email is already in use by another user
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${user.id}
    `

    if (existingUser.length > 0) {
      return { success: false, error: 'Este email já está em uso' }
    }

    // Update user
    await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, updated_at = NOW()
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
      return { success: false, error: 'Não autorizado' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' }
    }

    // Get current user with password
    const users = await sql`
      SELECT password FROM users WHERE id = ${user.id}
    `

    if (users.length === 0) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password)
    if (!isValid) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    revalidatePath('/perfil')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating password:', error)
    return { success: false, error: 'Erro ao atualizar senha' }
  }
}
