'use client'

import React from "react"
import { useState, useTransition } from 'react'
import type { BracketMatch, Player } from '@/lib/data'
import { setMatchPlayersAction, setMatchResultAction, updatePlaceholderPlayerAction } from '@/lib/actions/admin'
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
  tournamentStatus: string
}

export function BracketRoundManager({ round, roundName, matches, players, tournamentId, tournamentStatus }: Props) {
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
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                tournamentId={tournamentId}
                tournamentStatus={tournamentStatus}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function MatchCard({
  match,
  players,
  tournamentId,
  tournamentStatus
}: {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  tournamentStatus: string;
}) {
  const hasPlayers = (match.player1_id || match.player1_type !== 'PLAYER') &&
                    (match.player2_id || match.player2_type !== 'PLAYER')
  const isCompleted = match.status === 'completed'
  const isDraft = tournamentStatus === 'draft'

  const getPlayerDisplay = (playerId: number | null, name: string | null, type: string, seedNum: number | null) => {
    if (type === 'BYE') return <span className="text-slate-400 italic font-medium">BYE</span>
    if (type === 'QUALIFIER') return <span className={name ? "text-slate-700" : "text-amber-600 italic font-bold"}>
      {name ? `${name} (Q)` : "Qualifier (Q)"}
    </span>
    if (type === 'WILDCARD') return <span className={name ? "text-slate-700" : "text-blue-600 italic font-bold"}>
      {name ? `${name} (WC)` : "Wild Card (WC)"}
    </span>
    if (type === 'SEED') return <span className={name ? "text-slate-700" : "text-emerald-600 italic font-bold"}>
      {seedNum && <span className="text-xs mr-1">[{seedNum}]</span>}
      {name || `Seed #${seedNum}`}
    </span>
    return name || <span className="text-slate-400 italic">A definir</span>
  }

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all group ${
      isCompleted ? 'border-emerald-100 bg-emerald-50/30' :
      hasPlayers ? 'border-blue-100 bg-blue-50/30' :
      'border-slate-100 bg-slate-50/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Jogo {match.position}</span>
        {isCompleted ? (
          <Badge className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0 rounded-full">FINALIZADO</Badge>
        ) : match.status === 'scheduled' ? (
          <Badge className="bg-blue-500 text-white text-[10px] font-black px-2 py-0 rounded-full">AGENDADO</Badge>
        ) : (
          <Badge className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0 rounded-full">PENDENTE</Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Player 1 */}
        {isDraft && match.round === 1 ? (
          <SetPlayersDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            trigger={
              <div className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/50 transition-colors ${
                isCompleted && match.winner_id === match.player1_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
              }`}>
                <div className={`flex items-center gap-2 text-sm truncate ${
                  isCompleted && match.winner_id === match.player1_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
                }`}>
                  {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
                </div>
                {isCompleted && match.winner_id === match.player1_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
                {!match.player1_id && match.player1_type === 'PLAYER' && <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            }
          />
        ) : !isDraft && (match.player1_type === 'QUALIFIER' || match.player1_type === 'WILDCARD') && !match.player1_id ? (
          <ReplacePlaceholderDialog
            match={match}
            slot={1}
            players={players}
            tournamentId={tournamentId}
            trigger={
              <div className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors border border-dashed border-amber-300">
                <div className="flex items-center gap-2 text-sm truncate font-bold text-amber-700">
                  {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
                </div>
                <Pencil className="w-3 h-3 text-amber-500" />
              </div>
            }
          />
        ) : (
          <div className={`flex items-center justify-between p-2 rounded-xl ${
            isCompleted && match.winner_id === match.player1_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
          }`}>
            <div className={`flex items-center gap-2 text-sm truncate ${
              isCompleted && match.winner_id === match.player1_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
            }`}>
              {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
            </div>
            {isCompleted && match.winner_id === match.player1_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        )}

        {/* Player 2 */}
        {isDraft && match.round === 1 ? (
          <SetPlayersDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            trigger={
              <div className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/50 transition-colors ${
                isCompleted && match.winner_id === match.player2_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
              }`}>
                <div className={`flex items-center gap-2 text-sm truncate ${
                  isCompleted && match.winner_id === match.player2_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
                }`}>
                  {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
                </div>
                {isCompleted && match.winner_id === match.player2_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
                {!match.player2_id && match.player2_type === 'PLAYER' && <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            }
          />
        ) : !isDraft && (match.player2_type === 'QUALIFIER' || match.player2_type === 'WILDCARD') && !match.player2_id ? (
          <ReplacePlaceholderDialog
            match={match}
            slot={2}
            players={players}
            tournamentId={tournamentId}
            trigger={
              <div className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors border border-dashed border-amber-300">
                <div className="flex items-center gap-2 text-sm truncate font-bold text-amber-700">
                  {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
                </div>
                <Pencil className="w-3 h-3 text-amber-500" />
              </div>
            }
          />
        ) : (
          <div className={`flex items-center justify-between p-2 rounded-xl ${
            isCompleted && match.winner_id === match.player2_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
          }`}>
            <div className={`flex items-center gap-2 text-sm truncate ${
              isCompleted && match.winner_id === match.player2_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
            }`}>
              {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
            </div>
            {isCompleted && match.winner_id === match.player2_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        )}
      </div>

      {/* Score */}
      {isCompleted && match.score && (
        <div className="mt-3 py-1 px-3 bg-white/50 rounded-lg border border-emerald-100 inline-block">
          <p className="text-[11px] font-black text-emerald-700 tracking-widest">{match.score}</p>
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="mt-4 flex gap-2">
          {isDraft && match.round === 1 && (
            <SetPlayersDialog match={match} players={players} tournamentId={tournamentId} />
          )}
          {!isDraft && (
            <>
              {(match.player1_type === 'QUALIFIER' || match.player1_type === 'WILDCARD') && !match.player1_id && (
                <ReplacePlaceholderDialog match={match} slot={1} players={players} tournamentId={tournamentId} />
              )}
              {(match.player2_type === 'QUALIFIER' || match.player2_type === 'WILDCARD') && !match.player2_id && (
                <ReplacePlaceholderDialog match={match} slot={2} players={players} tournamentId={tournamentId} />
              )}
              {match.player1_id && match.player2_id && (
                <SetResultDialog match={match} tournamentId={tournamentId} />
              )}
            </>
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

function SlotConfig({
  label,
  type,
  setType,
  playerId,
  setPlayerId,
  seed,
  setSeed,
  players
}: {
  label: string
  type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'
  setType: (value: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE') => void
  playerId: string
  setPlayerId: (value: string) => void
  seed: string
  setSeed: (value: string) => void
  players: Player[]
}) {
  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="font-bold rounded-xl border-2"><SelectValue /></SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="PLAYER" className="font-bold">Jogador Específico</SelectItem>
          <SelectItem value="SEED" className="font-bold">Seed / Cabeça de Chave</SelectItem>
          <SelectItem value="QUALIFIER" className="font-bold">Qualifier (Q)</SelectItem>
          <SelectItem value="WILDCARD" className="font-bold">Wild Card (WC)</SelectItem>
          <SelectItem value="BYE" className="font-bold">BYE</SelectItem>
        </SelectContent>
      </Select>

      {type === 'SEED' && (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold">Número do Seed</Label>
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Ex: 1"
            className="rounded-xl border-2 font-bold"
          />
        </div>
      )}

      {(type === 'PLAYER' || type === 'SEED' || type === 'QUALIFIER' || type === 'WILDCARD') && (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold">{type === 'QUALIFIER' || type === 'WILDCARD' ? 'Jogador (Opcional)' : 'Selecionar Jogador'}</Label>
          <Select value={playerId} onValueChange={setPlayerId}>
            <SelectTrigger className="font-bold rounded-xl border-2"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {players.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function SetPlayersDialog({
  match,
  players,
  tournamentId,
  trigger
}: {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [p1Type, setP1Type] = useState<'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'>(match.player1_type as 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' || 'PLAYER')
  const [p1Id, setP1Id] = useState(match.player1_id?.toString() || '')
  const [p1Seed, setP1Seed] = useState(match.player1_seed?.toString() || '')

  const [p2Type, setP2Type] = useState<'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'>(match.player2_type as 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' || 'PLAYER')
  const [p2Id, setP2Id] = useState(match.player2_id?.toString() || '')
  const [p2Seed, setP2Seed] = useState(match.player2_seed?.toString() || '')

  function handleSubmit() {
    setError(null)

    const p1 = {
      type: p1Type,
      id: p1Type !== 'BYE' && p1Type !== 'QUALIFIER' && p1Type !== 'WILDCARD' ? parseInt(p1Id) : (p1Id ? parseInt(p1Id) : undefined),
      seed: p1Type === 'SEED' ? parseInt(p1Seed) : null
    }
    const p2 = {
      type: p2Type,
      id: p2Type !== 'BYE' && p2Type !== 'QUALIFIER' && p2Type !== 'WILDCARD' ? parseInt(p2Id) : (p2Id ? parseInt(p2Id) : undefined),
      seed: p2Type === 'SEED' ? parseInt(p2Seed) : null
    }

    if (p1.type === 'PLAYER' && !p1.id) return setError('Selecione o Jogador 1')
    if (p2.type === 'PLAYER' && !p2.id) return setError('Selecione o Jogador 2')
    if (p1.type === 'SEED' && (!p1.id || !p1.seed)) return setError('Defina o Seed e Jogador 1')
    if (p2.type === 'SEED' && (!p2.id || !p2.seed)) return setError('Defina o Seed e Jogador 2')
    if (p1.type === 'BYE' && p2.type === 'BYE') return setError('Bye nao pode enfrentar Bye')

    startTransition(async () => {
      await setMatchPlayersAction(match.id, p1 as any, p2 as any, tournamentId)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider border-2">
            <Pencil className="w-3 h-3 mr-1.5" /> Definir Confronto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Configurar Jogo {match.position}</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border-2 border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 py-4">
          <SlotConfig
            label="Lado A"
            type={p1Type}
            setType={setP1Type}
            playerId={p1Id}
            setPlayerId={setP1Id}
            seed={p1Seed}
            setSeed={setP1Seed}
            players={players}
          />
          <SlotConfig
            label="Lado B"
            type={p2Type}
            setType={setP2Type}
            playerId={p2Id}
            setPlayerId={setP2Id}
            seed={p2Seed}
            setSeed={setP2Seed}
            players={players}
          />
        </div>
        <Button onClick={handleSubmit} disabled={isPending} className="w-full h-12 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100">
          {isPending ? 'Salvando...' : 'Confirmar Confronto'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function ReplacePlaceholderDialog({
  match,
  slot,
  players,
  tournamentId,
  trigger
}: {
  match: BracketMatch;
  slot: 1 | 2;
  players: Player[];
  tournamentId: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [playerId, setPlayerId] = useState<string>('')
  const type = slot === 1 ? match.player1_type : match.player2_type

  function handleSubmit() {
    if (!playerId) return

    startTransition(async () => {
      await updatePlaceholderPlayerAction(match.id, slot, parseInt(playerId), tournamentId)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider border-2 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100">
            Definir {type === 'QUALIFIER' ? 'Q' : 'WC'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Definir Jogador ({type})</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm font-bold text-slate-500">
            Associe um jogador real ao slot de {type === 'QUALIFIER' ? 'Qualifier' : 'Wild Card'}.
          </p>
          <Select value={playerId} onValueChange={setPlayerId}>
            <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue placeholder="Selecione o jogador" /></SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {players.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={isPending || !playerId} className="w-full h-12 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700">
          {isPending ? 'Salvando...' : 'Confirmar Jogador'}
        </Button>
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
        <Button variant="default" size="sm" className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100">
          <Trophy className="w-3 h-3 mr-1.5" /> Resultado
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Registrar Resultado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-center flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Jogador A</p>
              <p className="font-bold text-slate-700">{match.player1_name}</p>
            </div>
            <div className="px-4 text-slate-300 font-black italic text-xl">VS</div>
            <div className="text-center flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Jogador B</p>
              <p className="font-bold text-slate-700">{match.player2_name}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border-2 border-red-100">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border-2 border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />Resultado salvo! Vencedor avançado.
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Selecione o Vencedor</Label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                winnerId === match.player1_id?.toString() ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player1_id?.toString()}
                  onChange={() => setWinnerId(match.player1_id?.toString() || '')}
                  className="hidden"
                />
                <span className="text-sm font-black text-center">{match.player1_name}</span>
                {winnerId === match.player1_id?.toString() && <Badge className="bg-emerald-500">VENCEDOR</Badge>}
              </label>
              <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                winnerId === match.player2_id?.toString() ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player2_id?.toString()}
                  onChange={() => setWinnerId(match.player2_id?.toString() || '')}
                  className="hidden"
                />
                <span className="text-sm font-black text-center">{match.player2_name}</span>
                {winnerId === match.player2_id?.toString() && <Badge className="bg-emerald-500">VENCEDOR</Badge>}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Placar Final</Label>
            <Input
              name="score"
              placeholder="Ex: 6-4 6-3 7-5"
              required
              className="h-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 text-lg font-black tracking-widest"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => {
                const input = document.querySelector('input[name="score"]') as HTMLInputElement;
                if (input) input.value = 'W/O';
              }} className="text-[10px] h-7 rounded-lg font-bold">W/O</Button>
              <p className="text-[10px] text-slate-400 font-bold ml-auto flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sets separados por espaço (6-4 3-6 7-6)
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100" disabled={isPending || success}>
            {isPending ? 'Salvando...' : success ? 'Sucesso!' : 'Confirmar Resultado'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
