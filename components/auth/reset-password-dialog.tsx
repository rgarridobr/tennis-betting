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

export function ResetPasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
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
      if (result.error.includes('expirou') || result.error.includes('invalidado')) {
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
      setError('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
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
      toast.success('Senha alterada com sucesso!')
      onOpenChange(false)
      window.location.href = '/dashboard' // Redirect to dashboard since it logs in automatically
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
          <DialogTitle>Recuperar Senha</DialogTitle>
          <DialogDescription>
            {step === 'email' && 'Informe seu e-mail para receber o código de recuperação.'}
            {step === 'code' && 'Digite o código de 5 caracteres enviado para o seu e-mail.'}
            {step === 'new-password' && 'Escolha sua nova senha de acesso.'}
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
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                required
                defaultValue={email}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'code' && (
          <div className="space-y-6 flex flex-col items-center">
            <InputOTP
                maxLength={5}
                value={code}
                onChange={setCode}
                onComplete={() => handleVerifyCode()}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-lg font-black" />
                <InputOTPSlot index={1} className="w-12 h-14 text-lg font-black" />
                <InputOTPSlot index={2} className="w-12 h-14 text-lg font-black" />
                <InputOTPSlot index={3} className="w-12 h-14 text-lg font-black" />
                <InputOTPSlot index={4} className="w-12 h-14 text-lg font-black" />
              </InputOTPGroup>
            </InputOTP>

            <div className="flex flex-col w-full gap-2">
                <Button
                    onClick={() => handleVerifyCode()}
                    className="w-full"
                    disabled={loading || code.length < 5}
                >
                    {loading ? 'Verificando...' : 'Verificar Código'}
                </Button>
                <Button variant="ghost" onClick={() => setStep('email')} disabled={loading} className="text-slate-500">
                    Voltar
                </Button>
            </div>
          </div>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha e Entrar'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
