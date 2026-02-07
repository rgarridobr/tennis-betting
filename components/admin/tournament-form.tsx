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
    <form action={handleSubmit} className="space-y-10">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-5 rounded-2xl flex items-center gap-3 border-2 border-red-100 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <Label htmlFor="name" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
          <Trophy className="w-4 h-4 text-emerald-500" /> Nome do Torneio
        </Label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Select name="name" required>
              <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                <SelectValue placeholder="Selecione o torneio" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {names.map(opt => (
                  <SelectItem key={opt.id} value={opt.name} className="font-bold">{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <MetadataManager type="name" title="Torneio" options={names} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Label htmlFor="surface" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> Superfície
          </Label>
          <Select name="surface" required>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="Hard" className="font-bold">Hard Court</SelectItem>
              <SelectItem value="Clay" className="font-bold">Saibro</SelectItem>
              <SelectItem value="Grass" className="font-bold">Grama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label htmlFor="location" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <MapPin className="w-4 h-4 text-emerald-500" /> Local
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select name="location" required>
                <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {locations.map(opt => (
                    <SelectItem key={opt.id} value={opt.name} className="font-bold">{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MetadataManager type="location" title="Local" options={locations} />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="start_date" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Calendar className="w-4 h-4 text-emerald-500" /> Data Início
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="end_date" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Calendar className="w-4 h-4 text-emerald-500" /> Data Fim
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            required
            className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
          />
        </div>
      </div>

      <div className="bg-emerald-50/50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-100">
        <p className="text-sm text-emerald-700 font-bold leading-relaxed">
          Ao criar o torneio, o sistema gerará automaticamente o chaveamento completo de 128 jogadores (127 partidas no total).
          Certifique-se de que as datas estão corretas antes de prosseguir.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full md:w-auto md:px-16 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white gap-3 text-lg font-black shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
        >
          {isPending ? 'Gerando chaveamento...' : 'Criar Torneio'}
          {!isPending && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </form>
  )
}
