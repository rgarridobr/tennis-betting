'use client'

import { useState } from 'react'
import { requestPasswordResetAction, verifyResetCodeAction, resetPasswordAction } from '@/lib/actions/password-reset'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useTranslations } from 'next-intl'

export function ResetPasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('auth')
  const tButtons = useTranslations('buttons')
  const [step, setStep] = useState<'email' | 'code' | 'new-password'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const currentEmail = formData.get('email') as string
    setEmail(currentEmail)

    const result = await requestPasswordResetAction(formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      setStep('code')
    } else if (result.error) {
      setError(result.error)
    }
  }

  async function handleVerifyCode(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (code.length < 5) return

    setLoading(true)
    setError(null)
    const result = await verifyResetCodeAction(email, code)
    setLoading(false)

    if (result.success) {
      setStep('new-password')
    } else if (result.error) {
      setError(result.error)
      // If code expired or many attempts, reset flow after a brief delay?
      if (
        (result as { code?: string }).code === 'CODE_EXPIRED' ||
        (result as { code?: string }).code === 'CODE_INVALIDATED'
      ) {
        setTimeout(() => {
          setStep('email')
          setCode('')
        }, 3000)
      }
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (newPassword.length < 6) {
      setError(t('passwordMin6'))
      return
    }

    setLoading(true)
    setError(null)

    // Add email and code to the formData for the action
    formData.append('email', email)
    formData.append('code', code)

    const result = await resetPasswordAction(formData)
    setLoading(false)

    if (result.success) {
      toast.success(t('resetSuccess'))
      onOpenChange(false)
      window.location.href = '/' // Redirect to home since it logs in automatically
    } else if (result.error) {
      setError(result.error)
    }
  }

  const resetFlow = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) resetFlow()
        onOpenChange(val)
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('resetTitle')}</DialogTitle>
          <DialogDescription>
            {step === 'email' && t('resetEmailDesc')}
            {step === 'code' && t('resetCodeDesc')}
            {step === 'new-password' && t('resetNewPasswordDesc')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{t('email')}</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder={t('resetEmailPlaceholder')}
                required
                defaultValue={email}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('resetSending') : t('resetSendCode')}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'code' && (
          <div className="space-y-6 flex flex-col items-center">
            <InputOTP
                maxLength={5}
                value={code}
                onChange={(val) => setCode(val.toUpperCase())}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                inputMode="text"
                autoCapitalize="characters"
                onComplete={() => handleVerifyCode()}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-lg font-black uppercase" />
                <InputOTPSlot index={1} className="w-12 h-14 text-lg font-black uppercase" />
                <InputOTPSlot index={2} className="w-12 h-14 text-lg font-black uppercase" />
                <InputOTPSlot index={3} className="w-12 h-14 text-lg font-black uppercase" />
                <InputOTPSlot index={4} className="w-12 h-14 text-lg font-black uppercase" />
              </InputOTPGroup>
            </InputOTP>

            <div className="flex flex-col w-full gap-2">
                <Button
                    onClick={() => handleVerifyCode()}
                    className="w-full"
                    disabled={loading || code.length < 5}
                >
                    {loading ? t('resetVerifying') : t('resetVerifyCode')}
                </Button>
                <Button variant="ghost" onClick={() => setStep('email')} disabled={loading} className="text-slate-500">
                    {tButtons('back')}
                </Button>
            </div>
          </div>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('resetNewPassword')}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder={t('resetPasswordPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('resetConfirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('resetSubmitting') : t('resetSubmit')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
