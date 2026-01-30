'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createTournamentAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Criando...' : 'Criar Torneio'}
    </Button>
  )
}

export function TournamentForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createTournamentAction(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Torneio</Label>
          <Input id="name" name="name" placeholder="Ex: Roland Garros 2025" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="surface">Superfície</Label>
          <Select name="surface" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clay">Saibro</SelectItem>
              <SelectItem value="grass">Grama</SelectItem>
              <SelectItem value="hard">Quadra dura</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Local</Label>
        <Input id="location" name="location" placeholder="Ex: Paris, França" required />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Data de Início</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Data de Término</Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_fee">Taxa de Inscrição (R$)</Label>
          <Input 
            id="entry_fee" 
            name="entry_fee" 
            type="number" 
            min="0" 
            step="0.01"
            placeholder="Ex: 25.00" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="upcoming">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Em breve</SelectItem>
              <SelectItem value="live">Ao vivo</SelectItem>
              <SelectItem value="finished">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
        <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
      </div>

      <SubmitButton />
    </form>
  )
}
