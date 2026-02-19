'use client'

import React, { useEffect, useState, useTransition } from "react"
import type { BracketMatch, Player } from '@/lib/data'
import { setMatchPlayersAction, setMatchResultAction, updatePlaceholderPlayerAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Pencil, Trophy, CheckCircle2, AlertCircle } from 'lucide-react'

// ==================== HELPER FUNCTIONS ====================

function formatPlayerName(name: string | null, seed: number | null, type?: string) {
  if (!name) {
    if (type === 'QUALIFIER') return 'Qualifier';
    if (type === 'WILDCARD') return 'Wild Card';
    if (type === 'BYE') return 'BYE';
    return 'A definir';
  }

  if (type === 'SEED' && seed) return `${name} (${seed})`;
  if (type === 'QUALIFIER') return `${name} (Q)`;
  if (type === 'WILDCARD') return `${name} (WC)`;
  return name;
}

// ==================== HELPER COMPONENTS ====================

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
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

// ==================== EXPORTED DIALOGS ====================

export function SetPlayersDialog({
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

  const [p1Type, setP1Type] = useState<'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'>(match.player1_type as any || 'PLAYER')
  const [p1Id, setP1Id] = useState(match.player1_id?.toString() || '')
  const [p1Seed, setP1Seed] = useState(match.player1_seed?.toString() || '')

  const [p2Type, setP2Type] = useState<'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE'>(match.player2_type as any || 'PLAYER')
  const [p2Id, setP2Id] = useState(match.player2_id?.toString() || '')
  const [p2Seed, setP2Seed] = useState(match.player2_seed?.toString() || '')

  useEffect(() => {
    if (open) {
      setP1Type(match.player1_type as any || 'PLAYER')
      setP1Id(match.player1_id?.toString() || '')
      setP1Seed(match.player1_seed?.toString() || '')
      setP2Type(match.player2_type as any || 'PLAYER')
      setP2Id(match.player2_id?.toString() || '')
      setP2Seed(match.player2_seed?.toString() || '')
      setError(null)
    }
  }, [open, match])

  function handleSubmit() {
    setError(null)

    const parseSeed = (val: string) => {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? null : parsed
    }

    const p1 = {
      type: p1Type,
      id: p1Type !== 'BYE' && p1Type !== 'QUALIFIER' && p1Type !== 'WILDCARD' ? parseInt(p1Id) : (p1Id ? parseInt(p1Id) : undefined),
      seed: p1Type === 'SEED' ? parseSeed(p1Seed) : null
    }
    const p2 = {
      type: p2Type,
      id: p2Type !== 'BYE' && p2Type !== 'QUALIFIER' && p2Type !== 'WILDCARD' ? parseInt(p2Id) : (p2Id ? parseInt(p2Id) : undefined),
      seed: p2Type === 'SEED' ? parseSeed(p2Seed) : null
    }

    if (p1.type === 'PLAYER' && !p1.id) return setError('Selecione o Jogador 1')
    if (p2.type === 'PLAYER' && !p2.id) return setError('Selecione o Jogador 2')
    if (p1.type === 'SEED' && (!p1.id || !p1.seed)) return setError('Defina o Seed e Jogador 1')
    if (p2.type === 'SEED' && (!p2.id || !p2.seed)) return setError('Defina o Seed e Jogador 2')
    if (p1.type === 'BYE' && p2.type === 'BYE') return setError('Bye não pode enfrentar Bye')

    startTransition(async () => {
      try {
        const result = await setMatchPlayersAction(match.id, p1 as any, p2 as any, tournamentId)
        if (result?.success) {
          setOpen(false)
        } else {
          setError('Erro ao salvar confronto')
        }
      } catch (e) {
        setError('Ocorreu um erro inesperado')
      }
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
        <div className="grid grid-cols-1 md:grid-cols-2 py-4 gap-4">
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

export function ReplacePlaceholderDialog({
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

  useEffect(() => {
    if (open) {
      setPlayerId(slot === 1 ? match.player1_id?.toString() || '' : match.player2_id?.toString() || '')
    }
  }, [open, match, slot])

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
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
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

export function SetResultDialog({ match, tournamentId, isFinalRound }: { match: BracketMatch; tournamentId: number; isFinalRound?: boolean }) {
  const [open, setOpen] = useState(false)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [winnerId, setWinnerId] = useState<string>(match.winner_id?.toString() || '')
  const [score, setScore] = useState(match.score || '')

  useEffect(() => {
    if (open) {
      setWinnerId(match.winner_id?.toString() || '')
      setScore(match.score || '')
      setError(null)
      setSuccess(false)
      setShowConfirmFinish(false)
    }
  }, [open, match])

  function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault()
    setError(null)
    setSuccess(false)

    if (isFinalRound && !showConfirmFinish) {
      setShowConfirmFinish(true)
      return
    }

    if (!winnerId || !score) {
      setError('Selecione o vencedor e o placar')
      setShowConfirmFinish(false)
      return
    }

    startTransition(async () => {
      const result = await setMatchResultAction(match.id, parseInt(winnerId), score.trim(), tournamentId)
      if (result.success) {
        setSuccess(true)
        setShowConfirmFinish(false)
        setTimeout(() => { setOpen(false); setSuccess(false); setWinnerId('') }, 1000)
      } else {
        setError(result.error || 'Erro ao salvar')
        setShowConfirmFinish(false)
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
              <p className="font-bold text-slate-700">
                {formatPlayerName(match.player1_name, match.player1_seed, match.player1_type)}
              </p>
            </div>
            <div className="px-4 text-slate-300 font-black italic text-xl">VS</div>
            <div className="text-center flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Jogador B</p>
              <p className="font-bold text-slate-700">
                {formatPlayerName(match.player2_name, match.player2_seed, match.player2_type)}
              </p>
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
                <span className="text-sm font-black text-center">
                  {formatPlayerName(match.player1_name, match.player1_seed, match.player1_type)}
                </span>
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
                <span className="text-sm font-black text-center">
                  {formatPlayerName(match.player2_name, match.player2_seed, match.player2_type)}
                </span>
                {winnerId === match.player2_id?.toString() && <Badge className="bg-emerald-500">VENCEDOR</Badge>}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Placar Final</Label>
            <Input
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Ex: 6-4 6-3 7-5"
              required
              className="h-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 text-lg font-black tracking-widest"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setScore('W/O')} className="text-[10px] h-7 rounded-lg font-bold">W/O</Button>
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

        <Dialog open={showConfirmFinish} onOpenChange={setShowConfirmFinish}>
          <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
            <DialogHeader className="pt-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-900">Finalizar Torneio?</DialogTitle>
              <DialogDescription className="text-center text-slate-500 font-medium px-4">
                Este é o jogo da <strong>FINAL</strong>. Ao confirmar este resultado, o torneio será marcado como <strong>FINALIZADO</strong> e não poderá mais ser alterado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 rounded-xl font-bold h-12 border-2"
              >
                Revisar
              </Button>
              <Button
                onClick={() => handleSubmit()}
                className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              >
                Sim, Finalizar!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
