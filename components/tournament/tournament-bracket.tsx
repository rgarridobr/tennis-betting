'use client'

import React, { useRef, useState, useTransition } from 'react'
import type { BracketMatch } from '@/lib/data'
import { makePredictionAction } from '@/lib/actions/predictions'
import { Check, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TournamentBracketProps {
  matches: BracketMatch[]
  userId: number
  tournamentId: number
  predictions: Record<number, number>
  canMakePredictions: boolean
  roundNames: Record<number, string>
}

export function TournamentBracket({
  matches,
  userId,
  tournamentId,
  predictions,
  canMakePredictions,
  roundNames
}: TournamentBracketProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Group matches by round
  const matchesByRound: Record<number, BracketMatch[]> = {}
  for (const m of matches) {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = []
    matchesByRound[m.round].push(m)
  }

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b)

  // Height of a match card (approximate including gaps)
  const CARD_HEIGHT = 110 // Reduced height since we removed photos and buttons
  const BASE_GAP = 32 // Gap between matches in round 1

  return (
    <div className="w-full bg-[#f8fafc] rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-auto p-12 min-h-[700px] relative scrollbar-hide"
      >
        <div className="flex gap-24 min-w-max relative pb-20">
          {rounds.map((round, roundIdx) => {
            const roundMatches = matchesByRound[round]
            const multiplier = Math.pow(2, roundIdx)
            const verticalGap = multiplier === 1 ? BASE_GAP : (multiplier * (CARD_HEIGHT + BASE_GAP)) - CARD_HEIGHT
            const paddingTop = multiplier === 1 ? 0 : (multiplier - 1) * (CARD_HEIGHT + BASE_GAP) / 2

            return (
              <div key={round} className="flex flex-col w-[300px] relative z-10">
                <div className="sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-sm py-3 mb-8 rounded-xl border border-slate-100 shadow-sm text-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    {roundNames[round] || `Rodada ${round}`}
                  </h3>
                </div>

                <div
                  className="flex flex-col flex-1"
                  style={{
                    gap: `${verticalGap}px`,
                    paddingTop: `${paddingTop}px`
                  }}
                >
                  {roundMatches.map((match, matchIdx) => (
                    <div key={match.id} className="relative">
                      <BracketMatchCard
                        match={match}
                        userId={userId}
                        tournamentId={tournamentId}
                        currentPrediction={predictions[match.id] || null}
                        canMakePredictions={canMakePredictions}
                      />

                      {/* Connectors to next round */}
                      {roundIdx < rounds.length - 1 && (
                        <div
                          className="absolute -right-24 top-1/2 w-24 pointer-events-none"
                          style={{
                            height: matchIdx % 2 === 0
                              ? `${verticalGap / 2 + CARD_HEIGHT / 2 + 2}px`
                              : `${verticalGap / 2 + CARD_HEIGHT / 2 + 2}px`,
                            top: matchIdx % 2 === 0 ? '50%' : 'auto',
                            bottom: matchIdx % 2 === 0 ? 'auto' : '50%',
                            borderRight: '2px solid rgb(226, 232, 240)',
                            borderTop: matchIdx % 2 === 0 ? '2px solid rgb(226, 232, 240)' : 'none',
                            borderBottom: matchIdx % 2 !== 0 ? '2px solid rgb(226, 232, 240)' : 'none',
                            borderRadius: matchIdx % 2 === 0 ? '0 12px 0 0' : '0 0 12px 0',
                          }}
                        >
                          {/* Horizontal segment out of the match */}
                          <div className={cn(
                            "absolute w-1/2 h-[2px] bg-slate-200",
                            matchIdx % 2 === 0 ? "top-0 left-0" : "bottom-0 left-0"
                          )} />

                          {/* Horizontal segment into next round match */}
                          <div className={cn(
                            "absolute w-1/2 h-[2px] bg-slate-200",
                            matchIdx % 2 === 0 ? "bottom-0 right-0" : "top-0 right-0"
                          )} />
                        </div>
                      )}

                      {/* Connector from previous round (horizontal part) */}
                      {roundIdx > 0 && (
                        <div className="absolute -left-12 top-1/2 w-12 h-[2px] bg-slate-200 -translate-y-1/2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BracketMatchCard({
  match,
  userId,
  tournamentId,
  currentPrediction,
  canMakePredictions
}: {
  match: BracketMatch
  userId: number
  tournamentId: number
  currentPrediction: number | null
  canMakePredictions: boolean
}) {
  const [selected, setSelected] = useState<number | null>(currentPrediction)
  const [isPending, startTransition] = useTransition()

  const isCompleted = match.status === 'completed'
  const canPredict = canMakePredictions && !isCompleted && match.player1_id && match.player2_id

  function handlePrediction(playerId: number) {
    if (!canPredict || isPending) return
    const newSelection = selected === playerId ? null : playerId
    setSelected(newSelection)

    startTransition(async () => {
      try {
        if (newSelection) {
          await makePredictionAction(userId, match.id, newSelection, tournamentId)
        }
      } catch {
        setSelected(currentPrediction)
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Player 1 */}
      <PlayerRow
        name={match.player1_name}
        seed={match.player1_seed_val}
        isWinner={match.winner_id === match.player1_id && isCompleted}
        isSelected={selected === match.player1_id}
        isPredicted={currentPrediction === match.player1_id}
        isCompleted={isCompleted}
        onSelect={() => match.player1_id && handlePrediction(match.player1_id)}
        canPredict={!!canPredict}
        score={match.score}
        isP1={true}
      />

      <div className="h-[1px] bg-slate-50 mx-4" />

      {/* Player 2 */}
      <PlayerRow
        name={match.player2_name}
        seed={match.player2_seed_val}
        isWinner={match.winner_id === match.player2_id && isCompleted}
        isSelected={selected === match.player2_id}
        isPredicted={currentPrediction === match.player2_id}
        isCompleted={isCompleted}
        onSelect={() => match.player2_id && handlePrediction(match.player2_id)}
        canPredict={!!canPredict}
        score={match.score}
        isP1={false}
      />
    </div>
  )
}

function PlayerRow({
  name,
  seed,
  isWinner,
  isSelected,
  isPredicted,
  isCompleted,
  onSelect,
  canPredict,
  score,
  isP1
}: {
  name: string | null
  seed: number | null
  isWinner: boolean
  isSelected: boolean
  isPredicted: boolean
  isCompleted: boolean
  onSelect: () => void
  canPredict: boolean
  score: string | null
  isP1: boolean
}) {
  if (!name) {
    return (
      <div className="flex items-center px-4 py-3 min-h-[48px]">
        <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">A definir</span>
      </div>
    )
  }

  const sets = score ? score.split(' ') : []

  const showPredictionResult = isCompleted && isPredicted
  const predictionCorrect = showPredictionResult && isWinner

  return (
    <div
      onClick={canPredict ? onSelect : undefined}
      className={cn(
        "flex items-center px-4 py-3 cursor-default transition-all relative min-h-[48px]",
        canPredict && "cursor-pointer hover:bg-emerald-50/40",
        isSelected && !isCompleted && "bg-emerald-50/60",
        showPredictionResult && (predictionCorrect ? "bg-emerald-50/80" : "bg-red-50/80")
      )}
    >
      {(isSelected || showPredictionResult) && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
          predictionCorrect ? "bg-emerald-500" : (showPredictionResult ? "bg-red-500" : "bg-emerald-500")
        )} />
      )}

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={cn(
          "text-xs font-black truncate tracking-tight",
          isWinner ? "text-slate-900" : "text-slate-600",
          (isSelected && !isCompleted) && "text-emerald-900",
          showPredictionResult && (predictionCorrect ? "text-emerald-900" : "text-red-900")
        )}>
          {name}
        </span>
        {seed && (
          <span className="text-[9px] font-black text-slate-400">
            ({seed})
          </span>
        )}
      </div>

      {/* Scores */}
      {sets.length > 0 && (
        <div className="flex items-center gap-1.5 ml-3">
          {sets.map((set, i) => {
            const parts = set.split('-')
            const setScore = isP1 ? parts[0] : parts[1]
            const opponentScore = isP1 ? parts[1] : parts[0]
            const isSetWinner = parseInt(setScore) > parseInt(opponentScore)

            return (
              <div
                key={i}
                className={cn(
                  "w-5 h-6 flex items-center justify-center text-[10px] font-black rounded-sm shadow-sm",
                  isSetWinner ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                )}
              >
                {setScore}
              </div>
            )
          })}
        </div>
      )}

      {/* Indicators (Selection, Winner, Prediction Result) */}
      <div className="flex items-center justify-center w-6 ml-2 shrink-0">
        {isSelected && !isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 animate-in zoom-in duration-200">
            <Check className="w-3 h-3 text-white" />
          </div>
        ) : isWinner ? (
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-100">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        ) : showPredictionResult && !predictionCorrect ? (
          <Badge variant="outline" className="text-[8px] font-black h-4 px-1 rounded-sm bg-red-50 border-red-200 text-red-500 uppercase tracking-tighter">
            Errou
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
