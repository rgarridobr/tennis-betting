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
  predictions: Record<number, string>  // matchId -> predicted winner name
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
  currentPrediction?: string  // predicted winner name
  canMakePredictions: boolean
}

function MatchCard({ match, userId, tournamentId, currentPrediction, canMakePredictions }: MatchCardProps) {
  const [selected, setSelected] = useState<string | undefined>(currentPrediction)
  const [isPending, startTransition] = useTransition()
  
  useEffect(() => {
    setSelected(currentPrediction)
  }, [currentPrediction])
  
  const isFinished = match.status === 'completed'
  const isLive = match.status === 'live'
  const canPredict = match.status === 'scheduled' && canMakePredictions

  function handlePrediction(playerName: string) {
    if (!canPredict || isPending) return
    
    setSelected(playerName)
    startTransition(async () => {
      try {
        await makePredictionAction(userId, match.id, playerName, tournamentId)
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
        <div className="flex items-center gap-2">
          {isFinished && match.score && (
            <span className="text-xs font-mono font-medium text-slate-700">{match.score}</span>
          )}
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
      </div>
      
      <CardContent className="p-0">
        <PlayerSelectableRow
          playerName={match.player1_name}
          country={match.player1_country}
          isWinner={match.winner === match.player1_name}
          isSelected={selected === match.player1_name}
          isPredicted={currentPrediction === match.player1_name}
          isFinished={isFinished}
          canPredict={canPredict}
          isPending={isPending}
          onSelect={() => handlePrediction(match.player1_name)}
        />
        
        <div className="border-t border-slate-200" />
        
        <PlayerSelectableRow
          playerName={match.player2_name}
          country={match.player2_country}
          isWinner={match.winner === match.player2_name}
          isSelected={selected === match.player2_name}
          isPredicted={currentPrediction === match.player2_name}
          isFinished={isFinished}
          canPredict={canPredict}
          isPending={isPending}
          onSelect={() => handlePrediction(match.player2_name)}
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
              Palpite registrado! Você pode alterar clicando em outro jogador.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PlayerSelectableRowProps {
  playerName: string
  country: string
  isWinner: boolean
  isSelected: boolean
  isPredicted: boolean
  isFinished: boolean
  canPredict: boolean
  isPending: boolean
  onSelect: () => void
}

function PlayerSelectableRow({ 
  playerName, 
  country, 
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
  
  let rowBgClass = ''
  let rowBorderClass = ''
  
  if (isSelected) {
    rowBgClass = 'bg-emerald-50'
    if (canPredict) {
      rowBorderClass = 'ring-2 ring-inset ring-emerald-500'
    }
  } else if (showPredictionResult) {
    rowBgClass = predictionCorrect ? 'bg-emerald-50' : 'bg-red-50'
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

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`
            ${isWinner && isFinished ? 'font-bold text-foreground' : 'text-foreground'}
            ${isSelected ? 'font-semibold text-emerald-700' : ''}
          `}>
            {playerName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({country})
          </span>
        </div>

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
    </div>
  )
}
