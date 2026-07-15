'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTournamentAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trophy, MapPin, Layers, Calendar, ArrowRight, AlertCircle, Users, Hash, Gift } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetadataManager } from './metadata-manager'
import type { TournamentMetadata } from '@/lib/data'
import { useTranslations } from 'next-intl'

interface Props {
  names: TournamentMetadata[]
  locations: TournamentMetadata[]
}

export function TournamentForm({ names, locations }: Props) {
  const t = useTranslations('admin')
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
            <Trophy className="w-4 h-4 text-emerald-500" /> {t('form.tournamentName')}
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select name="name" required onValueChange={setName}>
                <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                  <SelectValue placeholder={t('form.selectTournament')} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {names.map(opt => (
                    <SelectItem key={opt.id} value={opt.name} className="font-bold">{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MetadataManager type="name" title={t('form.metadataTournament')} options={names} />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="category" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> {t('form.category')}
          </Label>
          <div className="flex flex-col gap-3">
            <Select name="category" required defaultValue="GRAND_SLAM" onValueChange={setCategory}>
              <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                <SelectValue placeholder={t('form.selectCategory')} />
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

      <div className="space-y-4">
        <Label htmlFor="prize_description" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
          <Gift className="w-4 h-4 text-emerald-500" /> {t('form.prize')}
        </Label>
        <Textarea
          id="prize_description"
          name="prize_description"
          placeholder={t('form.prizePlaceholder')}
          className="min-h-28 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Label htmlFor="surface" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> {t('form.surface')}
          </Label>
          <Select name="surface" required>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder={t('form.select')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="Hard" className="font-bold">{t('form.hardCourt')}</SelectItem>
              <SelectItem value="Clay" className="font-bold">{t('form.clay')}</SelectItem>
              <SelectItem value="Grass" className="font-bold">{t('form.grass')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label htmlFor="location" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <MapPin className="w-4 h-4 text-emerald-500" /> {t('form.location')}
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select name="location" required>
                <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
                  <SelectValue placeholder={t('form.selectLocation')} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {locations.map(opt => (
                    <SelectItem key={opt.id} value={opt.name} className="font-bold">{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MetadataManager type="location" title={t('form.metadataLocation')} options={locations} />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="start_date" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Calendar className="w-4 h-4 text-emerald-500" /> {t('form.startDateTime')}
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
            <Calendar className="w-4 h-4 text-emerald-500" /> {t('form.endDate')}
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
            <Users className="w-4 h-4 text-emerald-500" /> {t('form.format')}
          </Label>
          <Select name="format" required defaultValue="SIMPLES">
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder={t('form.select')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="SIMPLES" className="font-bold">{t('form.singles')}</SelectItem>
              <SelectItem value="DUPLAS" className="font-bold" disabled>{t('form.doublesComing')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label htmlFor="sets_format" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Hash className="w-4 h-4 text-emerald-500" /> {t('form.sets')}
          </Label>
          <Select name="sets_format" required value={setsFormat} onValueChange={setSetsFormat} disabled={isATP || isMasters || isGrandSlam}>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder={t('form.select')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="3" className="font-bold">{t('form.bestOf3')}</SelectItem>
              <SelectItem value="5" className="font-bold">{t('form.bestOf5')}</SelectItem>
            </SelectContent>
          </Select>
          {(isATP || isMasters || isGrandSlam) && <input type="hidden" name="sets_format" value={setsFormat} />}
        </div>

        <div className="space-y-4">
          <Label htmlFor="size" className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" /> {t('form.bracketSize')}
          </Label>
          <Select name="size" required value={size} onValueChange={setSize} disabled={isATP || isMasters || isGrandSlam}>
            <SelectTrigger className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700">
              <SelectValue placeholder={t('form.select')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="8" className="font-bold">{t('form.playersRounds', { n: 8, r: 3 })}</SelectItem>
              <SelectItem value="16" className="font-bold">{t('form.playersRounds', { n: 16, r: 4 })}</SelectItem>
              <SelectItem value="32" className="font-bold">{t('form.playersRounds', { n: 32, r: 5 })}</SelectItem>
              <SelectItem value="64" className="font-bold">{t('form.playersRounds', { n: 64, r: 6 })}</SelectItem>
              <SelectItem value="128" className="font-bold">{t('form.playersRounds', { n: 128, r: 7 })}</SelectItem>
            </SelectContent>
          </Select>
          {(isATP || isMasters || isGrandSlam) && <input type="hidden" name="size" value={size} />}
        </div>
      </div>

      <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('form.bracketFeatures')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_seeds" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">{t('form.seeds')}</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_qualifiers" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">{t('form.qualifiers')}</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_wildcards" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">{t('form.wildCards')}</Label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="has_byes" value="true" defaultChecked className="w-5 h-5 accent-emerald-600" />
            <Label className="font-bold text-slate-700">{t('form.byes')}</Label>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50/50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-100">
        <p className="text-sm text-emerald-700 font-bold leading-relaxed">
          {t('form.generateHint')}
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full md:w-auto md:px-16 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 h-14"
        >
          {isPending ? t('form.generating') : t('form.createTournament')}
          {!isPending && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </form>
  )
}
