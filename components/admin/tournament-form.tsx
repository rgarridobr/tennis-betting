'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { createTournamentAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, MapPin, Layers, Calendar, ArrowRight, AlertCircle, Users, Hash } from 'lucide-react'
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
  const [category, setCategory] = useState<string>('GRAND_SLAM')
  const [size, setSize] = useState<string>('128')
  const [setsFormat, setSetsFormat] = useState<string>('5')
  const [name, setName] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('/images/categories/grandslam.png')
  const router = useRouter()

  const isATP = category === 'ATP_500' || category === 'ATP_250'
  const isMasters = category === 'MASTERS_1000'
  const isGrandSlam = category === 'GRAND_SLAM'

  useEffect(() => {
    if (isATP) {
      setSize('32')
      setSetsFormat('3')
    } else if (isMasters) {
      if (name.toLowerCase().includes('monte carlo')) {
        setSize('64')
      } else {
        setSize('128')
      }
      setSetsFormat('3')
    } else if (isGrandSlam) {
      setSize('128')
      setSetsFormat('5')
    }

    const categoryImages: Record<string, string> = {
      ATP_250: '/images/categories/atp250.png',
      ATP_500: '/images/categories/atp500.png',
      MASTERS_1000: '/images/categories/atpmasters1000.png',
      GRAND_SLAM: '/images/categories/grandslam.png',
    }
    setImageUrl(categoryImages[category] || '/images/categories/grandslam.png')
  }, [category, name, isATP, isMasters, isGrandSlam])

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label htmlFor="name" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Trophy className="w-4 h-4 text-emerald-500" /> Nome do Torneio
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select name="name" required onValueChange={setName}>
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

        <div className="space-y-4">
          <Label htmlFor="category" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> Categoria
          </Label>
          <div className="flex flex-col gap-3">
            <Select name="category" required defaultValue="GRAND_SLAM" onValueChange={setCategory}>
              <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="ATP_250" className="font-bold">ATP 250</SelectItem>
                <SelectItem value="ATP_500" className="font-bold">ATP 500</SelectItem>
                <SelectItem value="MASTERS_1000" className="font-bold">ATP Masters 1000</SelectItem>
                <SelectItem value="GRAND_SLAM" className="font-bold">Grand Slam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="status" value="STANDBY" />

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
              <SelectItem value="Saibro" className="font-bold">Saibro</SelectItem>
              <SelectItem value="Grama" className="font-bold">Grama</SelectItem>
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
            <Calendar className="w-4 h-4 text-emerald-500" /> Data e Hora Início
          </Label>
          <Input
            id="start_date"
            name="start_date"
            type="datetime-local"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Label htmlFor="format" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Users className="w-4 h-4 text-emerald-500" /> Formato
          </Label>
          <Select name="format" required defaultValue="SIMPLES">
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="SIMPLES" className="font-bold">Simples</SelectItem>
              <SelectItem value="DUPLAS" className="font-bold" disabled>Duplas (Em breve)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label htmlFor="sets_format" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Hash className="w-4 h-4 text-emerald-500" /> Sets
          </Label>
          <Select name="sets_format" required value={setsFormat} onValueChange={setSetsFormat} disabled={isATP || isMasters || isGrandSlam}>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="3" className="font-bold">Melhor de 3</SelectItem>
              <SelectItem value="5" className="font-bold">Melhor de 5</SelectItem>
            </SelectContent>
          </Select>
          {(isATP || isMasters || isGrandSlam) && <input type="hidden" name="sets_format" value={setsFormat} />}
        </div>

        <div className="space-y-4">
          <Label htmlFor="size" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> Tamanho da Chave
          </Label>
          <Select name="size" required value={size} onValueChange={setSize} disabled={isATP || isMasters || isGrandSlam}>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="8" className="font-bold">8 jogadores (3 rodadas)</SelectItem>
              <SelectItem value="16" className="font-bold">16 jogadores (4 rodadas)</SelectItem>
              <SelectItem value="32" className="font-bold">32 jogadores (5 rodadas)</SelectItem>
              <SelectItem value="64" className="font-bold">64 jogadores (6 rodadas)</SelectItem>
              <SelectItem value="128" className="font-bold">128 jogadores (7 rodadas)</SelectItem>
            </SelectContent>
          </Select>
          {(isATP || isMasters || isGrandSlam) && <input type="hidden" name="size" value={size} />}
        </div>
      </div>

      <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recursos do Chaveamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_seeds" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">Seeds</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_qualifiers" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">Qualifiers</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_wildcards" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">Wild Cards</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_byes" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">Byes</Label>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50/50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-100">
        <p className="text-sm text-emerald-700 font-bold leading-relaxed">
          O sistema gerará todas as rodadas e partidas vazias. Você poderá definir manualmente cada confronto da 1ª rodada na próxima etapa.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full md:w-auto md:px-16 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 h-14"
        >
          {isPending ? 'Gerando chaveamento...' : 'Criar Torneio'}
          {!isPending && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </form>
  )
}
