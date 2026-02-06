'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { createTournamentAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, MapPin, Layers, Calendar, ArrowRight, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetadataManager } from './metadata-manager'
import type { TournamentMetadata } from '@/lib/data'

interface Props {
  names: TournamentMetadata[]
  locations: TournamentMetadata[]
}

export function TournamentForm({ names, locations }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await createTournamentAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else if (result?.success && result.tournamentId) {
      router.push(`/admin/torneios/${result.tournamentId}`)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2 text-slate-700">
          <Trophy className="w-4 h-4 text-emerald-500" /> Nome do Torneio
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select name="name" required>
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-emerald-500 rounded-xl">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="surface" className="flex items-center gap-2 text-slate-700">
            <Layers className="w-4 h-4 text-blue-500" /> Superfície
          </Label>
          <Select name="surface" required>
            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
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
          <Label htmlFor="location" className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-rose-500" /> Local
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select name="location" required>
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-rose-500 rounded-xl">
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
          <Label htmlFor="start_date" className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-amber-500" /> Data Início
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="h-11 bg-slate-50 border-slate-200 focus:ring-amber-500 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date" className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-amber-600" /> Data Fim
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            required
            className="h-11 bg-slate-50 border-slate-200 focus:ring-amber-600 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          Ao criar o torneio, o sistema gerará automaticamente o chaveamento completo de 128 jogadores (127 partidas no total).
          Certifique-se de que as datas estão corretas antes de prosseguir.
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto md:px-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2 text-base font-semibold"
        >
          {isPending ? 'Gerando chaveamento...' : 'Criar Torneio'}
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  )
}
