'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { createTournamentAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, MapPin, Layers, Calendar, ArrowRight, AlertCircle, Settings2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetadataManager } from './metadata-manager'
import type { TournamentMetadata } from '@/lib/data'
import { useEffect } from 'react'

interface Props {
  names: TournamentMetadata[]
  locations: TournamentMetadata[]
}

const TOURNAMENT_CONFIGS = {
  GS: {
    bracket_size: 128,
    seeds_count: 32,
    byes_count: 0,
    direct_entries_count: 104,
    qualifiers_count: 16,
    wildcards_count: 8,
  },
  ATP1000_96: {
    bracket_size: 96,
    seeds_count: 32,
    byes_count: 32,
    direct_entries_count: 79,
    qualifiers_count: 12,
    wildcards_count: 5,
  },
  ATP1000_56: {
    bracket_size: 56,
    seeds_count: 16,
    byes_count: 8,
    direct_entries_count: 44,
    qualifiers_count: 7,
    wildcards_count: 5,
  },
  ATP500_48: {
    bracket_size: 48,
    seeds_count: 16,
    byes_count: 16,
    direct_entries_count: 37,
    qualifiers_count: 6,
    wildcards_count: 5,
  },
  ATP500_32: {
    bracket_size: 32,
    seeds_count: 8,
    byes_count: 0,
    direct_entries_count: 23,
    qualifiers_count: 4,
    wildcards_count: 5,
  },
  ATP250_28: {
    bracket_size: 28,
    seeds_count: 8,
    byes_count: 4,
    direct_entries_count: 18,
    qualifiers_count: 4,
    wildcards_count: 6, // Actually 18+4+3=25, plus 3 WC? User example said 28=18+4+2=24, plus 4 byes?
  },
};

// Exemplo (ATP 250 – chave 28):
// tamanho_chave = 28
// seeds = 8
// byes = 4 (32 - 28 = 4)
// diretos = 18
// qualy = 4
// wildcards = 2
// 18 + 4 + 2 = 24. 24 + 4 byes = 28 slots na 1a rodada.

export function TournamentForm({ names, locations }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [type, setType] = useState<string>('GS')
  const [config, setConfig] = useState(TOURNAMENT_CONFIGS.GS)
  const router = useRouter()

  useEffect(() => {
    if (type === 'GS') setConfig(TOURNAMENT_CONFIGS.GS)
    else if (type === 'ATP1000') setConfig(TOURNAMENT_CONFIGS.ATP1000_96)
    else if (type === 'ATP500') setConfig(TOURNAMENT_CONFIGS.ATP500_48)
    else if (type === 'ATP250') setConfig({
      bracket_size: 28,
      seeds_count: 8,
      byes_count: 4,
      direct_entries_count: 18,
      qualifiers_count: 4,
      wildcards_count: 2,
    })
  }, [type])

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type" className="flex items-center gap-2 text-slate-700">
            <Settings2 className="w-4 h-4 text-indigo-500" /> Tipo de Torneio
          </Label>
          <Select name="type" value={type} onValueChange={setType} required>
            <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-xl">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GS">Grand Slam (128)</SelectItem>
              <SelectItem value="ATP1000">ATP Masters 1000</SelectItem>
              <SelectItem value="ATP500">ATP 500</SelectItem>
              <SelectItem value="ATP250">ATP 250</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Tamanho Chave</Label>
          <Input name="bracket_size" type="number" value={config.bracket_size} onChange={e => setConfig({...config, bracket_size: parseInt(e.target.value)})} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Seeds</Label>
          <Input name="seeds_count" type="number" value={config.seeds_count} onChange={e => setConfig({...config, seeds_count: parseInt(e.target.value)})} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Byes</Label>
          <Input name="byes_count" type="number" value={config.byes_count} onChange={e => setConfig({...config, byes_count: parseInt(e.target.value)})} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Diretos</Label>
          <Input name="direct_entries_count" type="number" value={config.direct_entries_count} onChange={e => setConfig({...config, direct_entries_count: parseInt(e.target.value)})} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Qualy</Label>
          <Input name="qualifiers_count" type="number" value={config.qualifiers_count} onChange={e => setConfig({...config, qualifiers_count: parseInt(e.target.value)})} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-500">Wildcards</Label>
          <Input name="wildcards_count" type="number" value={config.wildcards_count} onChange={e => setConfig({...config, wildcards_count: parseInt(e.target.value)})} className="h-9" />
        </div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl border border-dashed border-emerald-200">
        <p className="text-xs text-emerald-700 leading-relaxed">
          <strong>Regra:</strong> diretos ({config.direct_entries_count}) + qualy ({config.qualifiers_count}) + wildcards ({config.wildcards_count}) = {config.direct_entries_count + config.qualifiers_count + config.wildcards_count} vagas.
          {config.bracket_size !== (config.direct_entries_count + config.qualifiers_count + config.wildcards_count + config.byes_count) && (
            <span className="text-red-500 block mt-1 font-semibold">
              Aviso: A soma das vagas + byes não confere com o tamanho da chave ({config.bracket_size}).
            </span>
          )}
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
