'use client'

import { useState, useTransition } from 'react'
import { BonusPrediction, Player } from '@/lib/data'
import { saveBonusPredictionsAction } from '@/lib/actions/predictions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trophy, Medal, Users, Save, Lock, Info } from 'lucide-react'

interface BonusPredictionsProps {
  tournamentId: number
  userId: number
  players: Player[]
  currentBonus: BonusPrediction | null
  hasStarted: boolean
}

export function BonusPredictions({
  tournamentId,
  userId,
  players,
  currentBonus,
  hasStarted
}: BonusPredictionsProps) {
  const [isPending, startTransition] = useTransition()

  const [picks, setPicks] = useState({
    champion_id: currentBonus?.champion_id?.toString() || '',
    runner_up_id: currentBonus?.runner_up_id?.toString() || '',
    semi1_id: currentBonus?.semi1_id?.toString() || '',
    semi2_id: currentBonus?.semi2_id?.toString() || '',
    semi3_id: currentBonus?.semi3_id?.toString() || '',
    semi4_id: currentBonus?.semi4_id?.toString() || '',
  })

  const handleSave = () => {
    // Validate
    const semiIds = [picks.semi1_id, picks.semi2_id, picks.semi3_id, picks.semi4_id].filter(Boolean)
    const distinctSemis = new Set(semiIds)
    if (distinctSemis.size !== semiIds.length) {
      toast.error('Os semifinalistas devem ser jogadores diferentes')
      return
    }

    startTransition(async () => {
      try {
        const result = await saveBonusPredictionsAction(userId, tournamentId, {
          champion_id: picks.champion_id ? parseInt(picks.champion_id) : null,
          runner_up_id: picks.runner_up_id ? parseInt(picks.runner_up_id) : null,
          semi1_id: picks.semi1_id ? parseInt(picks.semi1_id) : null,
          semi2_id: picks.semi2_id ? parseInt(picks.semi2_id) : null,
          semi3_id: picks.semi3_id ? parseInt(picks.semi3_id) : null,
          semi4_id: picks.semi4_id ? parseInt(picks.semi4_id) : null,
        })
        if (result.success) {
          toast.success('Palpites bônus salvos com sucesso!')
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao salvar palpites')
      }
    })
  }

  const isFormComplete = Object.values(picks).every(val => val !== '')

  return (
    <Card className="mb-8 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-400" />
              Palpites Bônus
            </CardTitle>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Escolha quem chegará longe e ganhe pontos extras!
            </p>
          </div>

          {hasStarted ? (
            <div className="bg-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-700">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Palpites Encerrados</span>
              {currentBonus && (
                <div className="ml-2 pl-2 border-l border-slate-700">
                  <span className="text-emerald-400 font-black">{currentBonus.points_earned} pts</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-500/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-500/20">
              <Info className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Abertos até o 1º jogo</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Champion & Runner-up */}
          <div className="space-y-6 lg:col-span-1">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Campeão (30 pts)
              </Label>
              <PlayerSelect
                players={players}
                value={picks.champion_id}
                onChange={(v) => setPicks(p => ({ ...p, champion_id: v }))}
                disabled={hasStarted || isPending}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Medal className="w-3.5 h-3.5 text-slate-400" />
                Vice-Campeão (20 pts)
              </Label>
              <PlayerSelect
                players={players}
                value={picks.runner_up_id}
                onChange={(v) => setPicks(p => ({ ...p, runner_up_id: v }))}
                disabled={hasStarted || isPending}
              />
            </div>
          </div>

          {/* Semifinalists */}
          <div className="lg:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Os 4 Semifinalistas (10 pts cada)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlayerSelect
                players={players}
                value={picks.semi1_id}
                onChange={(v) => setPicks(p => ({ ...p, semi1_id: v }))}
                disabled={hasStarted || isPending}
                placeholder="Semifinalista 1"
              />
              <PlayerSelect
                players={players}
                value={picks.semi2_id}
                onChange={(v) => setPicks(p => ({ ...p, semi2_id: v }))}
                disabled={hasStarted || isPending}
                placeholder="Semifinalista 2"
              />
              <PlayerSelect
                players={players}
                value={picks.semi3_id}
                onChange={(v) => setPicks(p => ({ ...p, semi3_id: v }))}
                disabled={hasStarted || isPending}
                placeholder="Semifinalista 3"
              />
              <PlayerSelect
                players={players}
                value={picks.semi4_id}
                onChange={(v) => setPicks(p => ({ ...p, semi4_id: v }))}
                disabled={hasStarted || isPending}
                placeholder="Semifinalista 4"
              />
            </div>
          </div>
        </div>

        {!hasStarted && (
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isPending || !isFormComplete}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
            >
              {isPending ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Palpites Bônus
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlayerSelect({
  players,
  value,
  onChange,
  disabled,
  placeholder = "Selecione um jogador..."
}: {
  players: Player[]
  value: string
  onChange: (v: string) => void
  disabled: boolean
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-slate-50 border-slate-100 rounded-2xl h-12 text-sm font-semibold focus:ring-emerald-500">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
        {players.map((p) => (
          <SelectItem
            key={p.id}
            value={p.id.toString()}
            className="rounded-xl font-medium focus:bg-emerald-50 focus:text-emerald-900"
          >
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
