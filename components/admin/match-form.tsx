'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createMatchAction } from '@/lib/actions/admin'
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
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Adicionando...' : 'Adicionar Partida'}
    </Button>
  )
}

interface MatchFormProps {
  tournamentId: number
}

export function MatchForm({ tournamentId }: MatchFormProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createMatchAction(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="tournament_id" value={tournamentId} />

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player1_name">Jogador 1</Label>
          <Input id="player1_name" name="player1_name" placeholder="Nome" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="player1_country">País</Label>
          <Input id="player1_country" name="player1_country" placeholder="Ex: BRA" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player2_name">Jogador 2</Label>
          <Input id="player2_name" name="player2_name" placeholder="Nome" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="player2_country">País</Label>
          <Input id="player2_country" name="player2_country" placeholder="Ex: ESP" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="round">Rodada</Label>
        <Select name="round" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="R128">1a Rodada</SelectItem>
            <SelectItem value="R64">2a Rodada</SelectItem>
            <SelectItem value="R32">3a Rodada</SelectItem>
            <SelectItem value="R16">Oitavas de Final</SelectItem>
            <SelectItem value="QF">Quartas de Final</SelectItem>
            <SelectItem value="SF">Semifinal</SelectItem>
            <SelectItem value="F">Final</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="match_date">Data e Hora</Label>
        <Input id="match_date" name="match_date" type="datetime-local" required />
      </div>

      <SubmitButton />
    </form>
  )
}
