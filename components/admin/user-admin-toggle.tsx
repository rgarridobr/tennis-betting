'use client'

import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toggleUserAdminAction } from '@/lib/actions/admin'

interface UserAdminToggleProps {
  userId: number
  isAdmin: boolean
}

export function UserAdminToggle({ userId, isAdmin }: UserAdminToggleProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleUserAdminAction(userId, checked)
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`admin-${userId}`}
        checked={isAdmin}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <Label htmlFor={`admin-${userId}`} className="text-sm text-muted-foreground">
        Admin
      </Label>
    </div>
  )
}
