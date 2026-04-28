'use server';

import { sql } from '@/lib/db';
import { sendResetCodeEmail } from '@/lib/email';
import { hashPassword, createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

/**
 * Generates a 5-character alphanumeric code using CSPRNG.
 */
function generateCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
}

/**
 * Step 1: Request a password reset code.
 */
export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'O email é obrigatório.' };
  }

  // Check if user exists
  const users = await sql`
    SELECT id FROM users WHERE email = ${email} AND (is_deleted IS FALSE OR is_deleted IS NULL)
  `;

  if (users.length === 0) {
    // For security, don't reveal that the user doesn't exist.
    // However, in this specific case, the requirements don't mention this,
    // and sometimes it's better for UX in small apps.
    // I will return a success message regardless.
    return { success: true, message: 'Se o e-mail estiver cadastrado, você receberá um código em instantes.' };
  }

  const results = await sql`
    SELECT email, code, expires_at, attempts FROM password_resets WHERE email = ${email}
  `;

  if (results.length > 0) {
    const record = results[0];
    const now = new Date();
    const expires = new Date(record.expires_at);

    if (now < expires) {
      if (record.attempts >= 5) {
        const remainingMs = expires.getTime() - now.getTime();
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        return { 
          error: `Limite de tentativas excedido. Aguarde ${remainingMins} minuto(s) para solicitar um novo código.` 
        };
      }
      
      return { 
        success: true, 
        message: 'Um código já foi enviado e ainda é válido. Verifique sua caixa de entrada.' 
      };
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete previous reset attempts for this email
  await sql`DELETE FROM password_resets WHERE email = ${email}`;

  // Save the new reset code
  await sql`
    INSERT INTO password_resets (email, code, expires_at, attempts)
    VALUES (${email}, ${code}, ${expiresAt.toISOString()}, 0)
  `;

  try {
    await sendResetCodeEmail(email, code);
    return { success: true, message: 'Código enviado com sucesso!' };
  } catch (error) {
    console.error('Error sending reset email:', error);
    return { error: 'Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.' };
  }
}

/**
 * Step 2: Verify the 5-digit code.
 */
export async function verifyResetCodeAction(email: string, code: string) {
  if (!email || !code) {
    return { error: 'E-mail e código são obrigatórios.' };
  }

  const normalizedCode = code.toUpperCase().trim();

  const results = await sql`
    SELECT id, code, expires_at, attempts FROM password_resets WHERE email = ${email}
  `;

  if (results.length === 0) {
    return { error: 'Solicitação de recuperação não encontrada ou expirada.' };
  }

  const record = results[0];

  // Check expiration
  if (new Date(record.expires_at) < new Date()) {
    return { error: 'O código expirou. Solicite um novo.' };
  }

  // Check attempts
  if (record.attempts >= 5) {
    return { error: 'Limite de tentativas excedido. O código foi invalidado.' };
  }

  // Check code
  if (record.code !== normalizedCode) {
    const newAttempts = record.attempts + 1;

    await sql`
      UPDATE password_resets SET attempts = ${newAttempts} WHERE email = ${email}
    `;

    if (newAttempts >= 5) {
      return { error: 'Limite de tentativas excedido. O código foi invalidado.' };
    }

    const remaining = 5 - newAttempts;
    return { error: `Código incorreto. Você tem mais ${remaining} tentativa(s).` };
  }

  return { success: true };
}

/**
 * Step 3: Reset the password and log in.
 */
export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!email || !code || !newPassword) {
    return { error: 'Todos os campos são obrigatórios.' };
  }

  // Re-verify the code for security before final update
  const verification = await verifyResetCodeAction(email, code);
  if (!verification.success) {
    return verification;
  }

  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset code
  await sql`
    UPDATE users SET password_hash = ${hashedPassword}, updated_at = NOW() WHERE email = ${email}
  `;
  await sql`DELETE FROM password_resets WHERE email = ${email}`;

  // Log the user in automatically
  const users = await sql`SELECT id FROM users WHERE email = ${email}`;
  const user = users[0];

  if (user) {
    await createSession(user.id);
    return { success: true };
  }

  return { error: 'Erro ao realizar login automático.' };
}
