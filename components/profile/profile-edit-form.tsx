'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateProfile } from '@/lib/actions/profile'
import { Loader2, Check, AlertCircle } from 'lucide-react'

interface ProfileEditFormProps {
  user: {
    id: number
    name: string
    email: string
    nickname?: string
    tennis_club?: string
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [nickname, setNickname] = useState(user.nickname || '')
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '')
  const [isNoneChecked, setIsNoneChecked] = useState(user.tennis_club === 'Nenhum')
  const [isFirstNameOnlyChecked, setIsFirstNameOnlyChecked] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (isFirstNameOnlyChecked) {
      const firstName = value.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const handleFirstNameOnlyChange = (checked: boolean) => {
    setIsFirstNameOnlyChecked(checked)
    if (checked) {
      const firstName = name.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const handleNoneChange = (checked: boolean) => {
    setIsNoneChecked(checked)
    if (checked) {
      setTennisClub('Nenhum')
    } else {
      setTennisClub(user.tennis_club === 'Nenhum' ? '' : user.tennis_club || '')
    }
  }
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  return (
    <div>
      {/* Profile Info Form */}
      <form action={handleProfileSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo (privado) *</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            placeholder=""
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="nickname">Apelido <span className="md:block hidden">(visível no site)</span></Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="first_name_only_profile"
                checked={isFirstNameOnlyChecked}
                onCheckedChange={handleFirstNameOnlyChange}
              />
              <label
                htmlFor="first_name_only_profile"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Apenas o primeiro nome
              </label>
            </div>
          </div>
          <Input
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            readOnly={isFirstNameOnlyChecked}
            className={isFirstNameOnlyChecked ? 'bg-slate-50 cursor-not-allowed' : ''}
            placeholder=""
          />
          <p className="text-xs text-slate-500">
            Seu nome real ficará privado, apenas este apelido será exibido publicamente
          </p>
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
    </div>
  )
}
