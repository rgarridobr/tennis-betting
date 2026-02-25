'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateProfile, updatePassword } from '@/lib/actions/profile'
import { Loader2, Check, AlertCircle } from 'lucide-react'

interface ProfileEditFormProps {
  user: {
    id: number
    name: string
    email: string
    tennis_club?: string
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '')
  const [isNoneChecked, setIsNoneChecked] = useState(user.tennis_club === 'Nenhum')

  const handleNoneChange = (checked: boolean) => {
    setIsNoneChecked(checked)
    if (checked) {
      setTennisClub('Nenhum')
    } else {
      setTennisClub(user.tennis_club === 'Nenhum' ? '' : user.tennis_club || '')
    }
  }
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleProfileSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordSubmit(formData: FormData) {
    setIsPasswordLoading(true)
    setPasswordMessage(null)

    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem' })
      setIsPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' })
      setIsPasswordLoading(false)
      return
    }

    try {
      const result = await updatePassword(formData)
      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Senha atualizada com sucesso!' })
        // Clear password fields
        const form = document.getElementById('password-form') as HTMLFormElement
        form?.reset()
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Erro ao atualizar senha' })
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Erro ao atualizar senha' })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Info Form */}
      <form action={handleProfileSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name}
            placeholder=""
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            disabled
            className="bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">O email não pode ser alterado</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="tennis_club">Clube em que joga tênis *</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="no_club_profile" 
                checked={isNoneChecked}
                onCheckedChange={handleNoneChange}
              />
              <label
                htmlFor="no_club_profile"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nenhum
              </label>
            </div>
          </div>
          <Input
            id="tennis_club"
            name="tennis_club"
            type="text"
            placeholder=""
            value={tennisClub}
            onChange={(e) => setTennisClub(e.target.value)}
            readOnly={isNoneChecked}
            className={isNoneChecked ? 'bg-slate-50 cursor-not-allowed' : ''}
            required
          />
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <Button 
          type="submit" 
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-slate-900 mb-4">Alterar Senha</h3>
        
        <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder=""
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder=""
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder=""
              required
              minLength={6}
            />
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              passwordMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {passwordMessage.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <Button 
            type="submit" 
            variant="outline"
            disabled={isPasswordLoading}
          >
            {isPasswordLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
