'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Trophy, X, ChevronDown, ChevronUp } from 'lucide-react'
import { makePredictionAction } from '@/lib/actions/predictions'
import { ROUND_ORDER, ROUND_POINTS } from '@/lib/data'
import type { Match } from '@/lib/data'

interface MatchListProps {
  matches: Match[]
  userId: number
  tournamentId: number
  predictions: Record<number, string>
  canMakePredictions?: boolean
}

export function MatchList({ matches, userId, tournamentId, predictions, canMakePredictions = false }: MatchListProps) {
  const matchesByRound: Record<string, Match[]> = {}
  for (const round of ROUND_ORDER) {
    const roundMatches = matches.filter(m => m.round === round)
    if (roundMatches.length > 0) {
      matchesByRound[round] = roundMatches
    }
  }

  return (
    <div className="space-y-6">
      {ROUND_ORDER.map(round => {
        const roundMatches = matchesByRound[round]
        if (!roundMatches) return null

        const completed = roundMatches.filter(m => m.status === 'completed').length
        const scheduledWithPlayers = roundMatches.filter(m => m.status === 'scheduled' && m.player1_name && m.player2_name).length
        const points = ROUND_POINTS[round] || 5

        return (
          <RoundSection
            key={round}
            round={round}
            matches={roundMatches}
            completed={completed}
            scheduledCount={scheduledWithPlayers}
            points={points}
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

interface RoundSectionProps {
  round: string
  matches: Match[]
  completed: number
  scheduledCount: number
  points: number
  userId: number
  tournamentId: number
  predictions: Record<number, string>
  canMakePredictions: boolean
}

function RoundSection({ round, matches, completed, scheduledCount, points, userId, tournamentId, predictions, canMakePredictions }: RoundSectionProps) {
  const [expanded, setExpanded] = useState(
    // Auto-expand rounds that have scheduled matches with players
    matches.some(m => m.status === 'scheduled' && m.player1_name && m.player2_name)
  )

  // Only show matches that have at least one player assigned
  const visibleMatches = matches.filter(m => m.player1_name || m.player2_name)

  if (visibleMatches.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-600">{round}</h3>
            <Badge variant="outline" className="text-xs text-slate-400">{matches.length} partidas</Badge>
          </div>
          <span className="text-xs text-slate-400">Aguardando definição dos jogadores</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors mb-3"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{round}</h3>
          <Badge variant="outline" className="text-xs">{visibleMatches.length} partidas</Badge>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">{points} pts cada</Badge>
          {completed > 0 && (
            <span className="text-xs text-emerald-600">{completed} finalizadas</span>
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
              currentPrediction={predictions[match.id]}
              canMakePredictions={canMakePredictions}
              points={points}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MatchCardProps {
  match: Match
  userId: number
  tournamentId: number
  currentPrediction?: string
  canMakePredictions: boolean
  points: number
}

function MatchCard({ match, userId, tournamentId, currentPrediction, canMakePredictions, points }: MatchCardProps) {
  const [selected, setSelected] = useState<string | undefined>(currentPrediction)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSelected(currentPrediction)
  }, [currentPrediction])

  const isCompleted = match.status === 'completed'
  const canPredict = match.status === 'scheduled' && canMakePredictions && match.player1_name && match.player2_name

  function handlePrediction(playerName: string) {
    if (!canPredict || isPending) return
    setSelected(playerName)
    startTransition(async () => {
      try {
        await makePredictionAction(userId, match.id, playerName, tournamentId)
      } catch {
        setSelected(currentPrediction)
      }
    })
  }

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
        <span className="text-xs text-slate-500">Jogo {match.match_number}</span>
        <div className="flex items-center gap-2">
          {isCompleted && match.score && (
            <span className="text-xs font-mono font-medium text-slate-700">{match.score}</span>
          )}
          <Badge
            variant="secondary"
            className={
              isCompleted ? 'bg-slate-400 text-white' :
              match.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-200 text-slate-600'
            }
          >
            {isCompleted ? 'Finalizado' : match.status === 'scheduled' ? 'Agendado' : 'Pendente'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        <PlayerRow
          playerName={match.player1_name}
          seed={match.player1_seed}
          isWinner={isCompleted && match.winner_name === match.player1_name}
          isSelected={selected === match.player1_name}
          isPredicted={currentPrediction === match.player1_name}
          isCompleted={isCompleted}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => match.player1_name && handlePrediction(match.player1_name)}
        />
        <div className="border-t border-slate-200" />
        <PlayerRow
          playerName={match.player2_name}
          seed={match.player2_seed}
          isWinner={isCompleted && match.winner_name === match.player2_name}
          isSelected={selected === match.player2_name}
          isPredicted={currentPrediction === match.player2_name}
          isCompleted={isCompleted}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => match.player2_name && handlePrediction(match.player2_name)}
        />

        {canPredict && !selected && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
            <p className="text-xs text-emerald-700 text-center">
              Clique no jogador que você acha que vai vencer
            </p>
          </div>
        )}

        {canPredict && selected && !isPending && (
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

interface PlayerRowProps {
  playerName: string | null
  seed: number | null
  isWinner: boolean
  isSelected: boolean
  isPredicted: boolean
  isCompleted: boolean
  canPredict: boolean
  isPending: boolean
  points: number
  onSelect: () => void
}

function PlayerRow({
  playerName, seed, isWinner, isSelected, isPredicted, isCompleted,
  canPredict, isPending, points, onSelect
}: PlayerRowProps) {
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
  if (isSelected) {
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
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {isPending && isSelected ? (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          ) : isSelected ? (
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

        <span className={`${isWinner && isCompleted ? 'font-bold text-slate-900' : 'text-slate-700'} ${isSelected ? 'font-semibold text-emerald-700' : ''}`}>
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
