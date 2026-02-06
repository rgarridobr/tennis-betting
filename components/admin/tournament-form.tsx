'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { MetadataManager } from './metadata-manager'
import type { TournamentMetadata } from '@/lib/data'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full md:w-1/2 md:mx-auto flex justify-center"
      disabled={pending}
    >
      {pending ? 'Criando torneio e gerando chaveamento...' : 'Criar Torneio (128 jogadores)'}
    </Button>
  )
}

interface Props {
  names: TournamentMetadata[]
  locations: TournamentMetadata[]
}

export function TournamentForm({ names, locations }: Props) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createTournamentAction(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success && result.tournamentId) {
      router.push(`/admin/torneios/${result.tournamentId}`)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Torneio</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select name="name" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o torneio" />
              </SelectTrigger>
              <SelectContent>
                {names.map(opt => (
                  <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <MetadataManager type="name" title="Torneio" options={names} />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="surface">Superfície</Label>
          <Select name="surface" required>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hard">Hard Court</SelectItem>
              <SelectItem value="Clay">Saibro</SelectItem>
              <SelectItem value="Grass">Grama</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Local</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select name="location" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(opt => (
                    <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MetadataManager type="location" title="Local" options={locations} />
          </div>
        </div>

                <div className="space-y-2">
          <Label htmlFor="start_date">Data Início</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Data Fim</Label>
          <Input id="end_date" name="end_date" type="date" required />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Ao criar o torneio, o chaveamento completo de 127 partidas (64 + 32 + 16 + 8 + 4 + 2 + 1) será gerado automaticamente.
      </p>

      <SubmitButton />
    </form>
  )
}
