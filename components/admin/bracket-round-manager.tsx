'use client'

import React from "react"
import { useState, useTransition } from 'react'
import type { BracketMatch, Player } from '@/lib/data'
import { setMatchPlayersAction, setMatchResultAction } from '@/lib/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ChevronDown, ChevronUp, Pencil, Trophy, CheckCircle2, AlertCircle, Hash } from 'lucide-react'

interface Props {
  round: number
  roundName: string
  matches: BracketMatch[]
  players: Player[]
  tournamentId: number
}

export function BracketRoundManager({ round, roundName, matches, players, tournamentId }: Props) {
  const [expanded, setExpanded] = useState(round === 1)
  const completed = matches.filter(m => m.status === 'completed').length
  const scheduled = matches.filter(m => m.status === 'scheduled').length
  const pending = matches.filter(m => m.status === 'pending').length

  return (
    <Card className="border-0 shadow-md overflow-hidden rounded-3xl">
      <CardHeader
        className={`cursor-pointer transition-all p-6 ${expanded ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expanded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{roundName}</CardTitle>
              <p className={`text-xs mt-0.5 ${expanded ? 'text-slate-400' : 'text-slate-500'}`}>
                {matches.length} partidas nesta rodada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {completed > 0 && (
                <Badge className={`${expanded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'} border-0`}>
                  {completed} Finalizadas
                </Badge>
              )}
              {scheduled > 0 && (
                <Badge className={`${expanded ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700'} border-0`}>
                  {scheduled} Agendadas
                </Badge>
              )}
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-6 bg-slate-50/50">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} players={players} tournamentId={tournamentId} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function MatchCard({ match, players, tournamentId }: { match: BracketMatch; players: Player[]; tournamentId: number }) {
  const hasPlayers = match.player1_id && match.player2_id
  const isCompleted = match.status === 'completed'

  return (
    <div className={`p-4 rounded-2xl border transition-all hover:shadow-md bg-white ${
      isCompleted ? 'border-emerald-200' :
      hasPlayers ? 'border-blue-200' :
      'border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">Jogo {match.position}</span>
        {isCompleted ? (
          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">Finalizado</Badge>
        ) : hasPlayers ? (
          <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">Agendado</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0">Pendente</Badge>
        )}
      </div>

      {/* Player 1 */}
      <div className={`flex items-center justify-between py-1 ${
        isCompleted && match.winner_id === match.player1_id ? 'font-bold text-emerald-700' : 'text-slate-700'
      }`}>
        <span className="truncate">
          {match.player1_seed && <span className="text-xs text-slate-400 mr-1">[{match.player1_seed}]</span>}
          {match.player1_name || <span className="text-slate-400 italic">A definir</span>}
        </span>
        {isCompleted && match.winner_id === match.player1_id && <Trophy className="w-3 h-3 text-emerald-600 shrink-0" />}
      </div>

      <div className="border-t border-slate-200 my-0.5" />

      {/* Player 2 */}
      <div className={`flex items-center justify-between py-1 ${
        isCompleted && match.winner_id === match.player2_id ? 'font-bold text-emerald-700' : 'text-slate-700'
      }`}>
        <span className="truncate">
          {match.player2_seed && <span className="text-xs text-slate-400 mr-1">[{match.player2_seed}]</span>}
          {match.player2_name || <span className="text-slate-400 italic">A definir</span>}
        </span>
        {isCompleted && match.winner_id === match.player2_id && <Trophy className="w-3 h-3 text-emerald-600 shrink-0" />}
      </div>

      {/* Score */}
      {isCompleted && match.score && (
        <p className="text-[10px] text-slate-500 mt-1 text-center">{match.score}</p>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="mt-2 flex gap-1">
          {round1NeedsPlayers(match) && (
            <SetPlayersDialog match={match} players={players} tournamentId={tournamentId} />
          )}
          {hasPlayers && (
            <SetResultDialog match={match} tournamentId={tournamentId} />
          )}
        </div>
      )}
    </div>
  )
}

function round1NeedsPlayers(match: BracketMatch): boolean {
  // Only round 1 matches can have players manually assigned
  // Later rounds get players from winners advancing
  return match.round === 1 && (!match.player1_id || !match.player2_id)
}

function SetPlayersDialog({ match, players, tournamentId }: { match: BracketMatch; players: Player[]; tournamentId: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [player1Id, setPlayer1Id] = useState<string>(match.player1_id?.toString() || '')
  const [player2Id, setPlayer2Id] = useState<string>(match.player2_id?.toString() || '')

  function handleSubmit() {
    setError(null)
    if (!player1Id || !player2Id) {
      setError('Selecione os dois jogadores')
      return
    }
    if (player1Id === player2Id) {
      setError('Selecione jogadores diferentes')
      return
    }

    startTransition(async () => {
      await setMatchPlayersAction(match.id, parseInt(player1Id), parseInt(player2Id), tournamentId)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-9 rounded-xl border-slate-200 hover:bg-slate-50">
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Jogadores
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Pencil className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Definir Jogadores</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Partida {match.position} • Rodada {match.round}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5" />{error}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="ml-1 text-slate-700 font-bold">Jogador 1</Label>
              <Select value={player1Id} onValueChange={setPlayer1Id}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Selecione o jogador" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-2xl shadow-xl border-slate-100">
                  {players
                    .filter(p => !player2Id || p.id.toString() !== player2Id)
                    .map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.seed ? `[${p.seed}] ` : ''}{p.name}{p.country ? ` (${p.country})` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="ml-1 text-slate-700 font-bold">Jogador 2</Label>
              <Select value={player2Id} onValueChange={setPlayer2Id}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Selecione o jogador" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-2xl shadow-xl border-slate-100">
                  {players
                    .filter(p => !player1Id || p.id.toString() !== player1Id)
                    .map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.seed ? `[${p.seed}] ` : ''}{p.name}{p.country ? ` (${p.country})` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar Jogadores'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SetResultDialog({ match, tournamentId }: { match: BracketMatch; tournamentId: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [winnerId, setWinnerId] = useState<string>('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const form = new FormData(e.currentTarget)
    const score = form.get('score') as string

    if (!winnerId || !score) {
      setError('Selecione o vencedor e o placar')
      return
    }

    startTransition(async () => {
      const result = await setMatchResultAction(match.id, parseInt(winnerId), score.trim(), tournamentId)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => { setOpen(false); setSuccess(false); setWinnerId('') }, 1000)
      } else {
        setError(result.error || 'Erro ao salvar')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex-1 text-xs h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10">
          <Trophy className="w-3.5 h-3.5 mr-1.5" /> Resultado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Registrar Resultado</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Partida {match.position} finalizada</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-center gap-4 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{match.player1_name}</span>
            <span className="text-slate-300 font-black italic">VS</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{match.player2_name}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />Resultado salvo com sucesso!
            </div>
          )}

          <div className="space-y-3">
            <Label className="ml-1 text-slate-700 font-bold">Vencedor da Partida</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex flex-col items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all hover:bg-slate-50 ${
                winnerId === match.player1_id?.toString() ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'border-slate-100'
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player1_id?.toString()}
                  onChange={() => setWinnerId(match.player1_id?.toString() || '')}
                  className="accent-emerald-600 h-4 w-4"
                />
                <span className="text-xs font-black text-center uppercase tracking-tight leading-tight">{match.player1_name}</span>
              </label>
              <label className={`flex flex-col items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all hover:bg-slate-50 ${
                winnerId === match.player2_id?.toString() ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'border-slate-100'
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player2_id?.toString()}
                  onChange={() => setWinnerId(match.player2_id?.toString() || '')}
                  className="accent-emerald-600 h-4 w-4"
                />
                <span className="text-xs font-black text-center uppercase tracking-tight leading-tight">{match.player2_name}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="ml-1 text-slate-700 font-bold">Placar Final</Label>
            <Input
              name="score"
              placeholder="Ex: 6-4 6-3 7-5"
              required
              className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 font-medium ml-1">Use espaços para separar os sets (ex: 6-4 3-6 7-6)</p>
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={isPending || success}>
            {isPending ? 'Salvando...' : success ? 'Sucesso!' : 'Confirmar Resultado'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
