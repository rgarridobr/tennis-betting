'use client'

import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toggleUserStatusAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface UserStatusToggleProps {
  userId: number
  isActive: boolean
}

export function UserStatusToggle({ userId, isActive }: UserStatusToggleProps) {
  const t = useTranslations('admin')
  const [isPending, startTransition] = useTransition()

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await toggleUserStatusAction(userId, checked)
      if (result.success) {
        toast.success(checked ? t('userActions.activated') : t('userActions.deactivated'))
      } else {
        toast.error(t('userActions.statusError'))
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-${userId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="data-[state=checked]:bg-emerald-500"
      />
      <Label htmlFor={`status-${userId}`} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {isActive ? t('active') : t('inactive')}
      </Label>
    </div>
  )
}
