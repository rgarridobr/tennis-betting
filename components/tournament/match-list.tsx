'use client'

import { useState, useTransition } from 'react'
import type { BracketMatch, Player } from '@/lib/data'
import { makePredictionAction } from '@/lib/actions/predictions'
import { getMatchPoints } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Check, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react'

interface MatchListProps {
  matches: BracketMatch[]
  userId: number
  tournamentId: number
  predictions: Record<number, { winnerId: number; score?: string }>
  canMakePredictions: boolean
  roundNames: Record<number, string>
  tournamentCategory?: string
  tournamentSize?: number
}

export function MatchList({
  matches, userId, tournamentId, predictions: initialPredictions, canMakePredictions, roundNames,
  tournamentCategory = 'GRAND_SLAM', tournamentSize = 128
}: MatchListProps) {
  const [predictions, setPredictions] = useState<Record<number, { winnerId: number; score?: string }>>(initialPredictions)

  // Group matches by round and position for easy lookup
  const matchesMap: Record<string, BracketMatch> = {}
  const matchesByRound: Record<number, BracketMatch[]> = {}
  for (const m of matches) {
    matchesMap[`${m.round}-${m.position}`] = m
    if (!matchesByRound[m.round]) matchesByRound[m.round] = []
    matchesByRound[m.round].push(m)
  }

  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 0

  // Map of player ID to player details
  const playersById: Record<number, { name: string; seed: number | null; type: string }> = {}
  for (const m of matches) {
    if (m.player1_id) playersById[m.player1_id] = { name: m.player1_name!, seed: m.player1_seed_val, type: m.player1_type }
    if (m.player2_id) playersById[m.player2_id] = { name: m.player2_name!, seed: m.player2_seed_val, type: m.player2_type }
  }

  const handlePredictionUpdate = (matchId: number, winnerId: number) => {
    setPredictions(prev => {
      const next = { ...prev }
      next[matchId] = { winnerId }

      // Cascade clearing similar to bracket view
      const match = matches.find(m => m.id === matchId)
      if (match && match.round < maxRound) {
        let currentRound = match.round
        let currentPos = match.position

        while (currentRound < maxRound) {
          const nextRound = currentRound + 1
          const nextPos = Math.ceil(currentPos / 2)
          const nextMatch = matchesMap[`${nextRound}-${nextPos}`]
          if (!nextMatch) break

          if (next[nextMatch.id]) {
            delete next[nextMatch.id]
          }
          currentRound = nextRound
          currentPos = nextPos
        }
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {rounds.map(round => {
        const roundMatches = matchesByRound[round]

        // A match is visible if it has players in DB OR if previous round matches have predictions
        const visibleMatches = roundMatches.filter(m => {
          if (m.player1_id || m.player2_id) return true
          if (round === 1) return false

          const prevRound = round - 1
          const m1 = matchesMap[`${prevRound}-${m.position * 2 - 1}`]
          const m2 = matchesMap[`${prevRound}-${m.position * 2}`]

          const p1_exists = m.player1_id || predictions[m1?.id]?.winnerId
          const p2_exists = m.player2_id || predictions[m2?.id]?.winnerId

          return p1_exists || p2_exists
        })

        if (visibleMatches.length === 0) return null

        return (
          <RoundSection
            key={round}
            round={round}
            totalRounds={rounds.length}
            roundName={roundNames[round] || `Rodada ${round}`}
            matches={visibleMatches}
            matchesMap={matchesMap}
            playersById={playersById}
            userId={userId}
            tournamentId={tournamentId}
            predictions={predictions}
            canMakePredictions={canMakePredictions}
            category={tournamentCategory}
            onPredictionUpdate={handlePredictionUpdate}
          />
        )
      })}
    </div>
  )
}

function RoundSection({
  round, totalRounds, roundName, matches, matchesMap, playersById, userId, tournamentId, predictions, canMakePredictions, category, onPredictionUpdate
}: {
  round: number
  totalRounds: number
  roundName: string
  matches: BracketMatch[]
  matchesMap: Record<string, BracketMatch>
  playersById: Record<number, any>
  userId: number
  tournamentId: number
  predictions: Record<number, { winnerId: number; score?: string }>
  canMakePredictions: boolean
  category: string
  onPredictionUpdate: (matchId: number, winnerId: number) => void
}) {
  const visibleMatches = matches
  const [expanded, setExpanded] = useState(visibleMatches.some(m => m.status !== 'completed'))
  const completedCount = visibleMatches.filter(m => m.status === 'completed').length
  const points = getMatchPoints(category, round, totalRounds)

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
          <Badge variant="outline" className="text-xs">{visibleMatches.length} partida {visibleMatches.length === 1 ? 's' : ''}</Badge>
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
              matchesMap={matchesMap}
              playersById={playersById}
              userId={userId}
              tournamentId={tournamentId}
              predictions={predictions}
              canMakePredictions={canMakePredictions}
              points={points}
              onPredictionUpdate={onPredictionUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({
  match, matchesMap, playersById, userId, tournamentId, predictions, canMakePredictions, points, onPredictionUpdate
}: {
  match: BracketMatch
  matchesMap: Record<string, BracketMatch>
  playersById: Record<number, any>
  userId: number
  tournamentId: number
  predictions: Record<number, { winnerId: number; score?: string }>
  canMakePredictions: boolean
  points: number
  onPredictionUpdate: (matchId: number, winnerId: number) => void
}) {
  const [isPending, startTransition] = useTransition()
  const currentPrediction = predictions[match.id] || null

  const isCompleted = match.status === 'completed'

  let p1: any = null
  let p2: any = null

  if (match.round === 1) {
    p1 = { id: match.player1_id, name: match.player1_name, seed: match.player1_seed_val, type: match.player1_type }
    p2 = { id: match.player2_id, name: match.player2_name, seed: match.player2_seed_val, type: match.player2_type }
  } else {
    const prevRound = match.round - 1
    const m1 = matchesMap[`${prevRound}-${match.position * 2 - 1}`]
    const m2 = matchesMap[`${prevRound}-${match.position * 2}`]

    const pred1 = predictions[m1?.id]?.winnerId
    const pred2 = predictions[m2?.id]?.winnerId

    if (match.player1_id) {
      p1 = { id: match.player1_id, name: match.player1_name, seed: match.player1_seed_val, type: match.player1_type }
    } else if (pred1) {
      p1 = { id: pred1, ...playersById[pred1] }
    }

    if (match.player2_id) {
      p2 = { id: match.player2_id, name: match.player2_name, seed: match.player2_seed_val, type: match.player2_type }
    } else if (pred2) {
      p2 = { id: pred2, ...playersById[pred2] }
    }
  }

  const canPredict = canMakePredictions && !isCompleted && p1?.id && p2?.id

  function handlePrediction(playerId: number) {
    if (!canPredict || isPending) return
    onPredictionUpdate(match.id, playerId)
    startTransition(async () => {
      try {
        await makePredictionAction(userId, match.id, playerId, tournamentId)
      } catch {
        // We could revert on failure, but for now we trust the server action
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
          playerName={p1?.name || null}
          seed={p1?.seed || null}
          type={p1?.type}
          playerId={p1?.id || null}
          isWinner={isCompleted && match.winner_id === p1?.id}
          isSelected={currentPrediction?.winnerId === p1?.id}
          isPredicted={currentPrediction?.winnerId === p1?.id}
          isCompleted={isCompleted}
          winnerId={match.winner_id}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => p1?.id && handlePrediction(p1.id)}
          isPlaceholder={!p1?.id && p1?.type !== 'BYE' && p1?.type !== 'PLAYER'}
          pointsCancelled={match.points_cancelled}
        />
        <div className="border-t border-slate-200" />
        <PlayerRow
          playerName={p2?.name || null}
          seed={p2?.seed || null}
          type={p2?.type}
          playerId={p2?.id || null}
          isWinner={isCompleted && match.winner_id === p2?.id}
          isSelected={currentPrediction?.winnerId === p2?.id}
          isPredicted={currentPrediction?.winnerId === p2?.id}
          isCompleted={isCompleted}
          winnerId={match.winner_id}
          canPredict={!!canPredict}
          isPending={isPending}
          points={points}
          onSelect={() => p2?.id && handlePrediction(p2.id)}
          isPlaceholder={!p2?.id && p2?.type !== 'BYE' && p2?.type !== 'PLAYER'}
          pointsCancelled={match.points_cancelled}
        />

        {!!canPredict && !currentPrediction?.winnerId && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
            <p className="text-xs text-emerald-700 text-center">
              Clique no jogador que você acha que vai vencer
            </p>
          </div>
        )}

        {!!canPredict && currentPrediction?.winnerId && !isPending && (
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
  playerName, seed, type, playerId, isWinner, isSelected, isPredicted, isCompleted,
  winnerId, canPredict, isPending, points, onSelect, isPlaceholder, pointsCancelled
}: {
  playerName: string | null
  seed: number | null
  type?: string
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
  isPlaceholder?: boolean
  pointsCancelled?: boolean
}) {
  const displayName = playerName || (
    type === 'QUALIFIER' ? 'Qualifier' :
    type === 'WILDCARD' ? 'Wild Card' :
    type === 'LUCKY_LOSER' ? 'Lucky Loser' :
    type === 'BYE' ? 'BYE' :
    null
  );

  if (!displayName) {
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

  const getIndicator = () => {
    if (isPlaceholder) return null;
    if (type === "SEED" && seed) return `(${seed})`;
    if (type === 'QUALIFIER') return '(Q)';
    if (type === 'WILDCARD') return '(WC)';
    if (type === 'LUCKY_LOSER') return '(LL)';
    return null;
  };

  const indicator = getIndicator();

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

        <span className={`${isWinner && isCompleted ? 'font-bold text-slate-900' : 'text-slate-700'} ${isSelected && !isCompleted ? 'font-semibold text-emerald-700' : ''} ${isPlaceholder ? 'text-amber-600 italic font-bold' : ''}`}>
          {displayName}
          {indicator && <span className="text-xs text-slate-400 ml-1">{indicator}</span>}
        </span>

        {showPredictionResult && (
          <Badge className={`ml-auto shrink-0 text-xs ${predictionCorrect && !pointsCancelled ? 'bg-emerald-500 text-white hover:bg-emerald-500' : 'bg-red-500 text-white hover:bg-red-500'}`}>
            {pointsCancelled ? 'Anulada' : predictionCorrect ? `+${points} pts` : 'Errou'}
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
