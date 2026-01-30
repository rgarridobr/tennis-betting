'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Trophy, X } from 'lucide-react'
import { makePredictionAction } from '@/lib/actions/predictions'
import type { Match } from '@/lib/data'

interface MatchListProps {
  matches: Match[]
  userId: number
  tournamentId: number
  predictions: Record<number, number>
  canMakePredictions?: boolean
}

const roundLabels: Record<string, string> = {
  R128: '1a Rodada',
  R64: '2a Rodada',
  R32: '3a Rodada',
  R16: 'Oitavas de Final',
  QF: 'Quartas de Final',
  SF: 'Semifinal',
  F: 'Final',
}

function formatMatchDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MatchList({ matches, userId, tournamentId, predictions, canMakePredictions = false }: MatchListProps) {
  const groupedMatches = matches.reduce((acc, match) => {
    const round = match.round
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  const roundOrder = ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F']
  const sortedRounds = Object.keys(groupedMatches).sort(
    (a, b) => roundOrder.indexOf(a) - roundOrder.indexOf(b)
  )

  return (
    <div className="space-y-8">
      {sortedRounds.map((round) => (
        <div key={round}>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {roundLabels[round] || round}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupedMatches[round].map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userId={userId}
                tournamentId={tournamentId}
                currentPrediction={predictions[match.id]}
                canMakePredictions={canMakePredictions}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface MatchCardProps {
  match: Match
  userId: number
  tournamentId: number
  currentPrediction?: number
  canMakePredictions: boolean
}

function MatchCard({ match, userId, tournamentId, currentPrediction, canMakePredictions }: MatchCardProps) {
  const [selected, setSelected] = useState<number | undefined>(currentPrediction)
  const [isPending, startTransition] = useTransition()
  
  // Sync selected state with currentPrediction from server
  useEffect(() => {
    setSelected(currentPrediction)
  }, [currentPrediction])
  
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const canPredict = match.status === 'scheduled' && canMakePredictions

  function handlePrediction(winner: number) {
    if (!canPredict || isPending) return
    
    setSelected(winner)
    startTransition(async () => {
      try {
        await makePredictionAction(userId, match.id, winner, tournamentId)
      } catch (error) {
        setSelected(currentPrediction)
      }
    })
  }

  return (
    <Card className={`overflow-hidden ${isFinished ? 'bg-slate-50' : 'bg-card'}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b">
        <span className="text-xs text-muted-foreground">
          {formatMatchDate(match.match_date)}
        </span>
        <Badge 
          variant="secondary"
          className={
            isLive ? 'bg-emerald-500 text-white' : 
            isFinished ? 'bg-slate-400 text-white' : 
            'bg-amber-100 text-amber-800'
          }
        >
          {isLive ? 'Ao vivo' : isFinished ? 'Finalizado' : 'Agendado'}
        </Badge>
      </div>
      
      <CardContent className="p-0">
        {/* Player 1 Row */}
        <PlayerSelectableRow
          playerNumber={1}
          name={match.player1_name}
          country={match.player1_country}
          score={match.player1_score}
          isWinner={match.winner === 1}
          isSelected={selected === 1}
          isPredicted={currentPrediction === 1}
          isFinished={isFinished}
          canPredict={canPredict}
          isPending={isPending}
          onSelect={() => handlePrediction(1)}
        />
        
        <div className="border-t border-slate-200" />
        
        {/* Player 2 Row */}
        <PlayerSelectableRow
          playerNumber={2}
          name={match.player2_name}
          country={match.player2_country}
          score={match.player2_score}
          isWinner={match.winner === 2}
          isSelected={selected === 2}
          isPredicted={currentPrediction === 2}
          isFinished={isFinished}
          canPredict={canPredict}
          isPending={isPending}
          onSelect={() => handlePrediction(2)}
        />

        {/* Prediction Help Text */}
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
              Palpite registrado! Você pode alterar clicando em outro jogador.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PlayerSelectableRowProps {
  playerNumber: number
  name: string
  country: string
  score: string | null
  isWinner: boolean
  isSelected: boolean
  isPredicted: boolean
  isFinished: boolean
  canPredict: boolean
  isPending: boolean
  onSelect: () => void
}

function PlayerSelectableRow({ 
  playerNumber,
  name, 
  country, 
  score, 
  isWinner, 
  isSelected,
  isPredicted,
  isFinished, 
  canPredict,
  isPending,
  onSelect 
}: PlayerSelectableRowProps) {
  const showPredictionResult = isFinished && isPredicted
  const predictionCorrect = showPredictionResult && isWinner
  const showCurrentPrediction = isPredicted && !isFinished && !canPredict
  
  // Determine row styling
  let rowBgClass = ''
  let rowBorderClass = ''
  
  if (isSelected) {
    rowBgClass = 'bg-emerald-50'
    if (canPredict) {
      rowBorderClass = 'ring-2 ring-inset ring-emerald-500'
    }
  } else if (showPredictionResult) {
    if (predictionCorrect) {
      rowBgClass = 'bg-emerald-50'
    } else {
      rowBgClass = 'bg-red-50'
    }
  } else if (showCurrentPrediction) {
    rowBgClass = 'bg-amber-50'
  } else if (isWinner && isFinished) {
    rowBgClass = 'bg-slate-50'
  }

  return (
    <div 
      className={`
        flex items-center justify-between px-4 py-3.5 
        ${rowBgClass} ${rowBorderClass}
        ${canPredict ? 'cursor-pointer hover:bg-emerald-50 transition-colors' : ''}
        ${isPending ? 'opacity-50' : ''}
      `}
      onClick={canPredict && !isPending ? onSelect : undefined}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Selection indicator / Result indicator */}
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
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
          ) : isWinner && isFinished ? (
            <Trophy className="w-4 h-4 text-amber-500" />
          ) : canPredict ? (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>

        {/* Player name and country inline */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`
            ${isWinner && isFinished ? 'font-bold text-foreground' : 'text-foreground'}
            ${isSelected ? 'font-semibold text-emerald-700' : ''}
          `}>
            {name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({country})
          </span>
        </div>

        {/* Prediction badges */}
        {showPredictionResult && (
          <Badge 
            className={`
              flex-shrink-0 text-xs
              ${predictionCorrect 
                ? 'bg-emerald-500 text-white hover:bg-emerald-500' 
                : 'bg-red-500 text-white hover:bg-red-500'
              }
            `}
          >
            {predictionCorrect ? '+10 pts' : 'Errou'}
          </Badge>
        )}
        
        {showCurrentPrediction && (
          <Badge className="flex-shrink-0 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
            Seu palpite
          </Badge>
        )}
      </div>
      
      {/* Score */}
      {score && (
        <span className={`
          font-mono text-sm ml-3 flex-shrink-0
          ${isWinner ? 'font-bold text-foreground' : 'text-muted-foreground'}
        `}>
          {score}
        </span>
      )}
    </div>
  )
}
