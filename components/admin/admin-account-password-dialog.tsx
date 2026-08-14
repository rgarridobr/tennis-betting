'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/lib/actions/profile'
import { AlertCircle, KeyRound, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function AdminAccountPasswordDialog() {
  const tAdmin = useTranslations('admin')
  const tProfile = useTranslations('profile')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const newPassword = (formData.get('newPassword') as string | null)?.trim() ?? ''
    const confirmPassword = (formData.get('confirmPassword') as string | null)?.trim() ?? ''

    if (newPassword !== confirmPassword) {
      setError(tProfile('passwordMismatch'))
      return
    }

    if (newPassword.length < 6) {
      setError(tProfile('passwordMinLength'))
      return
    }

    startTransition(async () => {
      const result = await updatePassword(formData)

      if (result.success) {
        toast.success(tProfile('passwordSuccess'))
        setOpen(false)
      } else {
        setError(result.error || tProfile('passwordError'))
      }
    })
  }

  return (
    <>
      <DropdownMenuItem
        onSelect={(event) => {
          event.preventDefault()
          setError(null)
          setOpen(true)
        }}
        className="cursor-pointer"
      >
        <KeyRound className="w-4 h-4" />
        {tProfile('changePassword')}
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              {tProfile('passwordTitle')}
            </DialogTitle>
            <DialogDescription>{tAdmin('accountPasswordDescription')}</DialogDescription>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-current-password">{tProfile('currentPassword')}</Label>
              <Input
                id="admin-current-password"
                name="currentPassword"
                type="password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-new-password">{tProfile('newPassword')}</Label>
              <Input
                id="admin-new-password"
                name="newPassword"
                type="password"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">{tProfile('confirmPassword')}</Label>
              <Input
                id="admin-confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tProfile('updating')}
                  </>
                ) : (
                  tProfile('changePassword')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
