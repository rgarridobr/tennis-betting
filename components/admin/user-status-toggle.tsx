'use client'

import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toggleUserActiveAction } from '@/lib/actions/admin'

interface UserStatusToggleProps {
  userId: number
  isActive: boolean
}

export function UserStatusToggle({ userId, isActive }: UserStatusToggleProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleUserActiveAction(userId, checked)
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-${userId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <Label htmlFor={`status-${userId}`} className="text-sm text-muted-foreground">
        Ativo
      </Label>
    </div>
  )
}
