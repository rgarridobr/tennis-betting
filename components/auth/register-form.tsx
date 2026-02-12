'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { registerAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { formatBrazilianPhoneNumber } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Criando conta...' : 'Criar conta'}
    </Button>
  )
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [whatsapp, setWhatsapp] = useState('')

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBrazilianPhoneNumber(e.target.value)
    setWhatsapp(formattedValue)
  }
  
  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await registerAction(formData)
    if (result?.error) {
      setError(result.error)
    }
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="text"
              placeholder="(99) 99999-9999"
              value={whatsapp}
              onChange={handleWhatsappChange}
              maxLength={15}
            />
          </div>
          
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
