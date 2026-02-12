'use client'

import { useState, useTransition } from 'react'
import type { BracketMatch } from '@/lib/data'
import { makePredictionAction } from '@/lib/actions/predictions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Check, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react'

interface MatchListProps {
  matches: BracketMatch[]
  userId: number
  tournamentId: number
  predictions: Record<number, number>
  canMakePredictions: boolean
  roundNames: Record<number, string>
}

const ROUND_POINTS: Record<number, number> = {
  1: 5, 2: 10, 3: 15, 4: 20, 5: 30, 6: 40, 7: 50
}

export function MatchList({ matches, userId, tournamentId, predictions, canMakePredictions, roundNames }: MatchListProps) {
  const matchesByRound: Record<number, BracketMatch[]> = {}
  for (const m of matches) {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = []
    matchesByRound[m.round].push(m)
  }

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {rounds.map(round => {
        const roundMatches = matchesByRound[round]
        const hasAnyPlayers = roundMatches.some(m => m.player1_id || m.player2_id)
        if (!hasAnyPlayers) return null

        return (
          <RoundSection
            key={round}
            round={round}
            roundName={roundNames[round] || `Rodada ${round}`}
            matches={roundMatches}
            userId={userId}
            tournamentId={tournamentId}
            predictions={predictions}
            canMakePredictions={canMakePredictions}
          />
        )
      })}
    </div>
  )
}

function RoundSection({
  round, roundName, matches, userId, tournamentId, predictions, canMakePredictions
}: {
  round: number
  roundName: string
  matches: BracketMatch[]
  userId: number
  tournamentId: number
  predictions: Record<number, number>
  canMakePredictions: boolean
}) {
  const visibleMatches = matches.filter(m => m.player1_id || m.player2_id)
  const [expanded, setExpanded] = useState(visibleMatches.some(m => m.status !== 'completed'))
  const completedCount = visibleMatches.filter(m => m.status === 'completed').length
  const points = ROUND_POINTS[round] || 5

  if (visibleMatches.length === 0) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors mb-3"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{roundName}</h3>
          <Badge variant="outline" className="text-xs">{visibleMatches.length} partidas</Badge>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">{points} pts cada</Badge>
          {completedCount > 0 && (
            <span className="text-xs text-emerald-600">{completedCount} finalizadas</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {expanded && (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              userId={userId}
              tournamentId={tournamentId}
              currentPrediction={predictions[match.id] || null}
              canMakePredictions={canMakePredictions}
              points={points}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({
  match, userId, tournamentId, currentPrediction, canMakePredictions, points
}: {
  match: BracketMatch
  userId: number
  tournamentId: number
  currentPrediction: number | null
  canMakePredictions: boolean
  points: number
}) {
  const [selected, setSelected] = useState<number | null>(currentPrediction)
  const [isPending, startTransition] = useTransition()

  const isCompleted = match.status === 'completed'
  const canPredict = canMakePredictions && !isCompleted && match.player1_id && match.player2_id

  function handlePrediction(playerId: number) {
    if (!canPredict || isPending) return
    setSelected(playerId)
    startTransition(async () => {
      try {
        await makePredictionAction(userId, match.id, playerId, tournamentId)
      } catch {
        setSelected(currentPrediction)
      }
    })
  }

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
        <span className="text-xs text-slate-500">Jogo {match.position}</span>
        <div className="flex items-center gap-2">
          {isCompleted && match.score && (
            <span className="text-xs font-mono font-medium text-slate-700">{match.score}</span>
          )}
        </div>
      </div>

      <CardContent className="p-0">
        <PlayerRow
          playerName={match.player1_name}
          seed={match.player1_seed}
          playerId={match.player1_id}
          isWinner={isCompleted && match.winner_id === match.player1_id}
          isSelected={selected === match.player1_id}
          isPredicted={currentPrediction === match.player1_id}
          isCompleted={isCompleted}
          winnerId={match.winner_id}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => match.player1_id && handlePrediction(match.player1_id)}
        />
        <div className="border-t border-slate-200" />
        <PlayerRow
          playerName={match.player2_name}
          seed={match.player2_seed}
          playerId={match.player2_id}
          isWinner={isCompleted && match.winner_id === match.player2_id}
          isSelected={selected === match.player2_id}
          isPredicted={currentPrediction === match.player2_id}
          isCompleted={isCompleted}
          winnerId={match.winner_id}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => match.player2_id && handlePrediction(match.player2_id)}
        />

        {!!canPredict && !selected && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
            <p className="text-xs text-emerald-700 text-center">
              Clique no jogador que você acha que vai vencer
            </p>
          </div>
        )}

        {!!canPredict && selected && !isPending && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
            <p className="text-xs text-emerald-700 text-center flex items-center justify-center gap-1">
              <Check className="w-3 h-3" />
              Palpite registrado! Clique em outro jogador para alterar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlayerRow({
  playerName, seed, playerId, isWinner, isSelected, isPredicted, isCompleted,
  winnerId, canPredict, isPending, points, onSelect
}: {
  playerName: string | null
  seed: number | null
  playerId: number | null
  isWinner: boolean
  isSelected: boolean
  isPredicted: boolean
  isCompleted: boolean
  winnerId: number | null
  canPredict: boolean
  isPending: boolean
  points: number
  onSelect: () => void
}) {
  if (!playerName) {
    return (
      <div className="flex items-center px-4 py-3.5 text-slate-400 italic text-sm">
        A definir
      </div>
    )
  }

  const showPredictionResult = isCompleted && isPredicted
  const predictionCorrect = showPredictionResult && isWinner
  const showCurrentPrediction = isPredicted && !isCompleted && !canPredict

  let rowBg = ''
  let rowBorder = ''
  if (isSelected && !isCompleted) {
    rowBg = 'bg-emerald-50'
    if (canPredict) rowBorder = 'ring-2 ring-inset ring-emerald-500'
  } else if (showPredictionResult) {
    rowBg = predictionCorrect ? 'bg-emerald-50' : 'bg-red-50'
  } else if (showCurrentPrediction) {
    rowBg = 'bg-amber-50'
  }

  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${rowBg} ${rowBorder} ${canPredict ? 'cursor-pointer hover:bg-emerald-50 transition-colors' : ''} ${isPending ? 'opacity-50' : ''}`}
      onClick={canPredict && !isPending ? onSelect : undefined}
      role={canPredict ? 'button' : undefined}
      tabIndex={canPredict ? 0 : undefined}
      onKeyDown={canPredict ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() } : undefined}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {isPending && isSelected ? (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          ) : isSelected && !isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : showPredictionResult ? (
            predictionCorrect ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
            )
          ) : showCurrentPrediction ? (
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : isWinner && isCompleted ? (
            <Trophy className="w-4 h-4 text-amber-500" />
          ) : canPredict ? (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>

        <span className={`${isWinner && isCompleted ? 'font-bold text-slate-900' : 'text-slate-700'} ${isSelected && !isCompleted ? 'font-semibold text-emerald-700' : ''}`}>
          {seed && <span className="text-xs text-slate-400 mr-1">[{seed}]</span>}
          {playerName}
        </span>

        {showPredictionResult && (
          <Badge className={`ml-auto shrink-0 text-xs ${predictionCorrect ? 'bg-emerald-500 text-white hover:bg-emerald-500' : 'bg-red-500 text-white hover:bg-red-500'}`}>
            {predictionCorrect ? `+${points} pts` : 'Errou'}
          </Badge>
        )}

        {showCurrentPrediction && (
          <Badge className="ml-auto shrink-0 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
            Seu palpite
          </Badge>
        )}
      </div>
    </div>
  )
}
