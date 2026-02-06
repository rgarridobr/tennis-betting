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
import { ChevronDown, ChevronUp, Pencil, Trophy, CheckCircle2, AlertCircle } from 'lucide-react'

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
    <Card className="border-0 shadow-sm">
      <CardHeader
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{roundName}</CardTitle>
            <Badge variant="outline" className="text-xs">{matches.length} partidas</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              {completed > 0 && <span className="text-emerald-600 font-medium">{completed} finalizadas</span>}
              {scheduled > 0 && <span className="text-blue-600 font-medium">{scheduled} agendadas</span>}
              {pending > 0 && <span className="text-slate-400 font-medium">{pending} pendentes</span>}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <div className={`p-3 rounded-lg border text-sm ${
      isCompleted ? 'border-emerald-200 bg-emerald-50/50' :
      hasPlayers ? 'border-blue-200 bg-blue-50/50' :
      'border-slate-200 bg-slate-50/50'
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
        <Button variant="outline" size="sm" className="flex-1 text-xs h-7 bg-transparent">
          <Pencil className="w-3 h-3 mr-1" /> Jogadores
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir Jogadores - Jogo {match.position}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Jogador 1</Label>
            <Select value={player1Id} onValueChange={setPlayer1Id}>
              <SelectTrigger><SelectValue placeholder="Selecione o jogador" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.seed ? `[${p.seed}] ` : ''}{p.name}{p.country ? ` (${p.country})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jogador 2</Label>
            <Select value={player2Id} onValueChange={setPlayer2Id}>
              <SelectTrigger><SelectValue placeholder="Selecione o jogador" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.seed ? `[${p.seed}] ` : ''}{p.name}{p.country ? ` (${p.country})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Jogadores'}
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
        <Button variant="default" size="sm" className="flex-1 text-xs h-7">
          <Trophy className="w-3 h-3 mr-1" /> Resultado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Resultado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 font-medium text-center">
            {match.player1_name} vs {match.player2_name}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <CheckCircle2 className="w-4 h-4" />Resultado salvo! Vencedor avancado.
            </div>
          )}

          <div className="space-y-2">
            <Label>Vencedor</Label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                winnerId === match.player1_id?.toString() ? 'bg-emerald-50 border-emerald-300' : ''
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player1_id?.toString()}
                  onChange={() => setWinnerId(match.player1_id?.toString() || '')}
                  className="accent-emerald-600"
                />
                <span className="text-sm truncate">{match.player1_name}</span>
              </label>
              <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                winnerId === match.player2_id?.toString() ? 'bg-emerald-50 border-emerald-300' : ''
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player2_id?.toString()}
                  onChange={() => setWinnerId(match.player2_id?.toString() || '')}
                  className="accent-emerald-600"
                />
                <span className="text-sm truncate">{match.player2_name}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Placar</Label>
            <Input name="score" placeholder="Ex: 6-4 6-3 7-5" required />
            <p className="text-xs text-slate-400">Sets separados por espaco (ex: 6-4 3-6 7-6)</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || success}>
            {isPending ? 'Salvando...' : success ? 'Salvo!' : 'Confirmar Resultado'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
