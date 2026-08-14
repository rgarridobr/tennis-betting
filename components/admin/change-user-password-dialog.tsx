'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserPasswordAction } from '@/lib/actions/admin'
import { AlertCircle, Check, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'

interface ChangeUserPasswordDialogProps {
  userId: number
  userName: string
}

export function ChangeUserPasswordDialog({ userId, userName }: ChangeUserPasswordDialogProps) {
  const tAdmin = useTranslations('admin')
  const tAuth = useTranslations('auth')
  const tButtons = useTranslations('buttons')
  const tCommon = useTranslations('common')
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const newPassword = (formData.get('newPassword') as string | null)?.trim() ?? ''
    const confirmPassword = (formData.get('confirmPassword') as string | null)?.trim() ?? ''

    if (newPassword !== confirmPassword) {
      const message = tAuth('passwordMismatch')
      setError(message)
      return
    }

    if (newPassword.length < 6) {
      const message = tAuth('passwordMin6')
      setError(message)
      return
    }

    startTransition(async () => {
      const result = await updateUserPasswordAction(userId, formData)

      if (result.success) {
        toast.success(tAdmin('changeUserPassword.toastSuccess'))
        setOpen(false)
      } else {
        setError(result.error || tCommon('error'))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={tAdmin('changeUserPassword.title')}
          className="h-9 w-9 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
        >
          <KeyRound className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md p-0">
        <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 border border-amber-200 shadow-sm">
            <KeyRound className="w-7 h-7 text-amber-600" />
          </div>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-left">
            {tAdmin('changeUserPassword.title')}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-400 mt-1 text-left">
            {tAdmin('changeUserPassword.description', { name: userName })}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded-2xl flex items-center gap-3 border-2 border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`new-password-${userId}`} className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
              <KeyRound className="w-3 h-3 text-amber-500" /> {tAdmin('changeUserPassword.newPassword')}
            </Label>
            <Input
              id={`new-password-${userId}`}
              name="newPassword"
              type="password"
              required
              minLength={6}
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-amber-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`confirm-password-${userId}`} className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
              <Check className="w-3 h-3 text-amber-500" /> {tAdmin('changeUserPassword.confirmPassword')}
            </Label>
            <Input
              id={`confirm-password-${userId}`}
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-amber-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-14 rounded-2xl border-2 border-slate-100 text-slate-500 font-black px-8 hover:bg-slate-50 transition-all"
            >
              {tButtons('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white gap-3 font-black shadow-xl shadow-amber-200 transition-all active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {tAdmin('changeUserPassword.updating')}
                </>
              ) : (
                tAdmin('changeUserPassword.submit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
