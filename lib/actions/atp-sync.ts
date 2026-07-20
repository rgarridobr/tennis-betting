'use server'

import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { runAtpSync } from '@/scripts/sync-atp-calendar-logic'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server';

async function requireAdmin() {
  const user = await getSession()
  if (!user || !user.is_admin) {
    redirect('/')
  }
  return user
}

export async function getLastSyncTime() {
  await requireAdmin()
  const res = await sql`SELECT value FROM system_configs WHERE key = 'last_atp_sync'`
  return res.length > 0 ? res[0].value : null
}

export async function syncAtpCalendarAction() {
  const t = await getTranslations('errors');
  await requireAdmin()

  const lastSync = await getLastSyncTime()
  if (lastSync) {
    const lastSyncDate = new Date(lastSync)
    const now = new Date()
    const diff = now.getTime() - lastSyncDate.getTime()
    const oneDay = 24 * 60 * 60 * 1000

    if (diff < oneDay) {
      const remaining = oneDay - diff
      const hours = Math.floor(remaining / (60 * 60 * 1000))
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
      return {
        success: false,
        error: t('adminSyncRateLimit', { hours, minutes })
      }
    }
  }

  try {
    const result = await runAtpSync()
    revalidatePath('/admin/torneios')
    return { success: true, ...result }
  } catch (error: any) {
    console.error("ATP Sync Error:", error)
    return { success: false, error: t('adminAtpSyncFailed') }
  }
}
