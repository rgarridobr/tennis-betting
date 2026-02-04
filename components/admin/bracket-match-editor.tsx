'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Trophy, Check } from 'lucide-react'
import { createBracketEntry, setMatchWinner } from '@/lib/actions/bracket'

interface Athlete {
  id: number
  name: string
  country: string | null
  seed: number | null
}

interface BracketEntry {
  id: number
  tournament_id: number
  round: number
  position: number
  player1_id: number | null
  player2_id: number | null
  winner_id: number | null
  score: string | null
  player1_name: string | null
  player2_name: string | null
}

interface BracketMatchEditorProps {
  entry: BracketEntry
  athletes: Athlete[]
  tournamentId: number
  onClose: () => void
}

export function BracketMatchEditor({ entry, athletes, tournamentId, onClose }: BracketMatchEditorProps) {
  const [player1Id, setPlayer1Id] = useState<string>(entry.player1_id?.toString() || '')
  const [player2Id, setPlayer2Id] = useState<string>(entry.player2_id?.toString() || '')
  const [winnerId, setWinnerId] = useState<string>(entry.winner_id?.toString() || '')
  const [score, setScore] = useState(entry.score || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPlayers = entry.player1_id && entry.player2_id
  const canSetWinner = player1Id && player2Id

  async function handleSavePlayers() {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('tournamentId', tournamentId.toString())
    formData.set('round', entry.round.toString())
    formData.set('position', entry.position.toString())
    if (player1Id) formData.set('player1Id', player1Id)
    if (player2Id) formData.set('player2Id', player2Id)

    const result = await createBracketEntry(formData)
    setIsLoading(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao salvar')
    }
  }

  async function handleSetWinner() {
    if (!winnerId) {
      setError('Selecione um vencedor')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('entryId', entry.id.toString())
    formData.set('winnerId', winnerId)
    formData.set('score', score)

    const result = await setMatchWinner(formData)
    setIsLoading(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao definir vencedor')
    }
  }

  // Get available athletes (excluding already selected ones)
  const getAvailableAthletes = (excludeId?: string) => {
    return athletes.filter(a => 
      a.id.toString() !== excludeId
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600" />
            Partida #{entry.position} - Rodada {entry.round}
          </DialogTitle>
          <DialogDescription>
            Configure os jogadores e o resultado da partida
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Jogador 1</Label>
              <Select value={player1Id} onValueChange={setPlayer1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o jogador 1" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAthletes(player2Id).map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id.toString()}>
                      <div className="flex items-center gap-2">
                        {athlete.seed && (
                          <Badge variant="outline" className="text-xs">
                            {athlete.seed}
                          </Badge>
                        )}
                        <span>{athlete.name}</span>
                        {athlete.country && (
                          <span className="text-slate-400">({athlete.country})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-sm text-slate-400">vs</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-2">
              <Label>Jogador 2</Label>
              <Select value={player2Id} onValueChange={setPlayer2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o jogador 2" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAthletes(player1Id).map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id.toString()}>
                      <div className="flex items-center gap-2">
                        {athlete.seed && (
                          <Badge variant="outline" className="text-xs">
                            {athlete.seed}
                          </Badge>
                        )}
                        <span>{athlete.name}</span>
                        {athlete.country && (
                          <span className="text-slate-400">({athlete.country})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save Players Button */}
          {(!hasPlayers || player1Id !== entry.player1_id?.toString() || player2Id !== entry.player2_id?.toString()) && (
            <Button 
              onClick={handleSavePlayers}
              disabled={isLoading || !player1Id || !player2Id}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Salvar Jogadores
            </Button>
          )}

          {/* Winner Selection */}
          {canSetWinner && (
            <>
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-sm text-slate-700">Definir Vencedor</h4>
                
                <div className="space-y-2">
                  <Label>Vencedor</Label>
                  <Select value={winnerId} onValueChange={setWinnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vencedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {player1Id && (
                        <SelectItem value={player1Id}>
                          {athletes.find(a => a.id.toString() === player1Id)?.name || 'Jogador 1'}
                        </SelectItem>
                      )}
                      {player2Id && (
                        <SelectItem value={player2Id}>
                          {athletes.find(a => a.id.toString() === player2Id)?.name || 'Jogador 2'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Placar (opcional)</Label>
                  <Input
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Ex: 6-4, 7-6, 6-3"
                  />
                </div>

                <Button 
                  onClick={handleSetWinner}
                  disabled={isLoading || !winnerId}
                  variant="default"
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  Definir Vencedor e Avançar
                </Button>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
