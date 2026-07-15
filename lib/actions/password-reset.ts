'use server';

import { sql } from '@/lib/db';
import { sendResetCodeEmail } from '@/lib/email';
import { hashPassword, createSession } from '@/lib/auth';
import crypto from 'crypto';
import { getTranslations, getLocale } from 'next-intl/server';

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
  const t = await getTranslations('errors');
  const locale = await getLocale();
  const email = formData.get('email') as string;

  if (!email) {
    return { error: t('emailRequired') };
  }

  const users = await sql`
    SELECT id FROM users WHERE email = ${email} AND (is_deleted IS FALSE OR is_deleted IS NULL)
  `;

  if (users.length === 0) {
    return { success: true, message: t('resetEmailIfExists') };
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
          error: t('rateLimitMinutes', { n: remainingMins }),
        };
      }

      return {
        success: true,
        message: t('codeStillValid'),
      };
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await sql`DELETE FROM password_resets WHERE email = ${email}`;

  await sql`
    INSERT INTO password_resets (email, code, expires_at, attempts)
    VALUES (${email}, ${code}, ${expiresAt.toISOString()}, 0)
  `;

  try {
    await sendResetCodeEmail(email, code, locale);
    return { success: true, message: t('codeSent') };
  } catch (error) {
    console.error('Error sending reset email:', error);
    return { error: t('emailSendFailed') };
  }
}

/**
 * Step 2: Verify the 5-digit code.
 */
export async function verifyResetCodeAction(email: string, code: string) {
  const t = await getTranslations('errors');

  if (!email || !code) {
    return { error: t('emailCodeRequired') };
  }

  const normalizedCode = code.toUpperCase().trim();

  const results = await sql`
    SELECT id, code, expires_at, attempts FROM password_resets WHERE email = ${email}
  `;

  if (results.length === 0) {
    return { error: t('resetNotFound'), code: 'RESET_NOT_FOUND' as const };
  }

  const record = results[0];

  if (new Date(record.expires_at) < new Date()) {
    return { error: t('codeExpired'), code: 'CODE_EXPIRED' as const };
  }

  if (record.attempts >= 5) {
    return { error: t('codeInvalidated'), code: 'CODE_INVALIDATED' as const };
  }

  if (record.code !== normalizedCode) {
    const newAttempts = record.attempts + 1;

    await sql`
      UPDATE password_resets SET attempts = ${newAttempts} WHERE email = ${email}
    `;

    if (newAttempts >= 5) {
      return { error: t('codeInvalidated'), code: 'CODE_INVALIDATED' as const };
    }

    const remaining = 5 - newAttempts;
    return { error: t('codeWrong', { n: remaining }) };
  }

  return { success: true };
}

/**
 * Step 3: Reset the password and log in.
 */
export async function resetPasswordAction(formData: FormData) {
  const t = await getTranslations('errors');
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!email || !code || !newPassword) {
    return { error: t('allFieldsRequired') };
  }

  const verification = await verifyResetCodeAction(email, code);
  if (!verification.success) {
    return verification;
  }

  const hashedPassword = await hashPassword(newPassword);

  await sql`
    UPDATE users SET password_hash = ${hashedPassword}, updated_at = NOW() WHERE email = ${email}
  `;
  await sql`DELETE FROM password_resets WHERE email = ${email}`;

  const users = await sql`SELECT id FROM users WHERE email = ${email}`;
  const user = users[0];

  if (user) {
    await createSession(user.id);
    return { success: true };
  }

  return { error: t('autoLoginFailed') };
}
