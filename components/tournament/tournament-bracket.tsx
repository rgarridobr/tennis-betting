'use client';

import React, { useRef, useState, useTransition } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import { makePredictionAction } from '@/lib/actions/predictions';
import { Check, Trophy, X, Pencil, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetPlayersDialog, ReplacePlaceholderDialog, SetResultDialog } from '@/components/admin/match-dialogs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TournamentBracketProps {
  matches: BracketMatch[];
  userId: number;
  tournamentId: number;
  predictions: Record<number, { winnerId: number; score?: string }>;
  canMakePredictions: boolean;
  roundNames: Record<number, string>;
  isAdmin?: boolean;
  players?: Player[];
  tournamentStatus?: string;
  bracketSubmitted?: boolean;
  hasStarted?: boolean;
}

export function TournamentBracket({
  matches,
  userId,
  tournamentId,
  predictions,
  canMakePredictions,
  roundNames,
  isAdmin = false,
  players = [],
  tournamentStatus = 'published',
  bracketSubmitted = false,
  hasStarted = false,
}: TournamentBracketProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [localPredictions, setLocalPredictions] = useState<Record<number, { winnerId: number; score?: string }>>(predictions);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, startTransition] = useTransition();

  // Group matches by round and position for easy lookup
  const matchesMap: Record<string, BracketMatch> = {};
  const matchesByRound: Record<number, BracketMatch[]> = {};
  for (const m of matches) {
    matchesMap[`${m.round}-${m.position}`] = m;
    if (!matchesByRound[m.round]) matchesByRound[m.round] = [];
    matchesByRound[m.round].push(m);
  }

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 0;

  // Map of player ID to player details for display in predicted rounds
  const playersById: Record<number, { name: string; seed: number | null; type: string }> = {};
  for (const m of matches) {
    if (m.player1_id) playersById[m.player1_id] = { name: m.player1_name!, seed: m.player1_seed, type: m.player1_type };
    if (m.player2_id) playersById[m.player2_id] = { name: m.player2_name!, seed: m.player2_seed, type: m.player2_type };
  }

  function handlePrediction(matchId: number, winnerId: number, score?: string) {
    if (!canMakePredictions) return;

    setLocalPredictions(prev => {
      const next = { ...prev };
      next[matchId] = { winnerId, score: score ?? prev[matchId]?.score };

      // Cascade: If we change a winner, we must clear any predictions in subsequent rounds
      // that depended on the old winner of this match.
      const match = matches.find(m => m.id === matchId);
      if (match && match.round < maxRound) {
        let currentRound = match.round;
        let currentPos = match.position;

        while (currentRound < maxRound) {
          const nextRound = currentRound + 1;
          const nextPos = Math.ceil(currentPos / 2);
          const nextMatch = matchesMap[`${nextRound}-${nextPos}`];
          if (!nextMatch) break;

          const currentPred = next[nextMatch.id];
          if (currentPred) {
            delete next[nextMatch.id];
          }

          currentRound = nextRound;
          currentPos = nextPos;
        }
      }

      return next;
    });
  }

  async function handleFinish() {
    if (!canMakePredictions || isSaving) return;
    setIsSaving(true);
    try {
      const { saveFullBracketAction } = await import('@/lib/actions/predictions');
      const predictionArray = Object.entries(localPredictions).map(([matchId, data]) => ({
        matchId: parseInt(matchId),
        winnerId: data.winnerId,
        score: data.score
      }));

      await saveFullBracketAction(userId, tournamentId, predictionArray, true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Ocorreu um erro ao salvar seu palpite. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const isBracketComplete = () => {
    return matches.every(m => localPredictions[m.id]?.winnerId) &&
           localPredictions[matches.find(m => m.round === maxRound)?.id || 0]?.score;
  };

  const CARD_HEIGHT = 160;
  const BASE_GAP = 32;

  return (
    <div className="flex flex-col gap-6">
      {canMakePredictions && (
        <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-emerald-900 leading-tight">Modo de Palpite Ativo</p>
              <p className="text-xs font-bold text-emerald-700">Preencha todo o chaveamento e clique em concluir.</p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            disabled={!isBracketComplete() || isSaving}
            className={cn(
              "px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg",
              isBracketComplete()
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            {isSaving ? "Salvando..." : "Concluir Palpite"}
          </button>
        </div>
      )}

      {bracketSubmitted && !hasStarted && (
        <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
          <Check className="w-6 h-6 text-blue-500" />
          <p className="font-bold text-blue-900">Seu palpite foi registrado com sucesso! Você poderá alterá-lo até o início do torneio.</p>
        </div>
      )}

      <div className="w-full bg-[#f8fafc] rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto p-12 min-h-[700px] relative scrollbar-hide"
        >
          <div className="flex gap-24 min-w-max relative pb-20">
            {rounds.map((round, roundIdx) => {
              const roundMatches = matchesByRound[round];
              const multiplier = Math.pow(2, roundIdx);
              const verticalGap = multiplier === 1 ? BASE_GAP : multiplier * (CARD_HEIGHT + BASE_GAP) - CARD_HEIGHT;
              const paddingTop = multiplier === 1 ? 0 : ((multiplier - 1) * (CARD_HEIGHT + BASE_GAP)) / 2;

              const isFinalRound = roundIdx === rounds.length - 1;

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
                      paddingTop: `${paddingTop}px`,
                    }}
                  >
                    {roundMatches.map((match, matchIdx) => {
                      let p1 = null;
                      let p2 = null;

                      if (match.round === 1 || isAdmin) {
                        p1 = { id: match.player1_id, name: match.player1_name, seed: match.player1_seed, type: match.player1_type };
                        p2 = { id: match.player2_id, name: match.player2_name, seed: match.player2_seed, type: match.player2_type };
                      } else {
                        const prevRound = match.round - 1;
                        const m1 = matchesMap[`${prevRound}-${match.position * 2 - 1}`];
                        const m2 = matchesMap[`${prevRound}-${match.position * 2}`];

                        const pred1 = localPredictions[m1?.id]?.winnerId;
                        const pred2 = localPredictions[m2?.id]?.winnerId;

                        if (pred1) p1 = { id: pred1, ...playersById[pred1] };
                        if (pred2) p2 = { id: pred2, ...playersById[pred2] };
                      }

                      return (
                        <div key={match.id} className="relative flex items-center" style={{ height: `${CARD_HEIGHT}px` }}>
                          <BracketMatchCard
                            match={match}
                            p1={p1}
                            p2={p2}
                            userId={userId}
                            tournamentId={tournamentId}
                            currentPrediction={localPredictions[match.id]}
                            actualPrediction={predictions[match.id]}
                            canMakePredictions={canMakePredictions}
                            isAdmin={isAdmin}
                            players={players}
                            tournamentStatus={tournamentStatus}
                            isFinalRound={isFinalRound}
                            onPredict={(winnerId, score) => handlePrediction(match.id, winnerId, score)}
                          />

                          {roundIdx < rounds.length - 1 && (
                            <div
                              className="absolute -right-24 top-1/2 w-24 pointer-events-none"
                              style={{
                                height: `${verticalGap / 2 + CARD_HEIGHT / 2 + 2}px`,
                                top: matchIdx % 2 === 0 ? '50%' : 'auto',
                                bottom: matchIdx % 2 === 0 ? 'auto' : '50%',
                                borderRight: '2px solid rgb(226, 232, 240)',
                                borderTop: matchIdx % 2 === 0 ? '2px solid rgb(226, 232, 240)' : 'none',
                                borderBottom: matchIdx % 2 !== 0 ? '2px solid rgb(226, 232, 240)' : 'none',
                                borderRadius: matchIdx % 2 === 0 ? '0 12px 0 0' : '0 0 12px 0',
                              }}
                            >
                              <div
                                className={cn(
                                  'absolute w-1/2 h-[2px] bg-slate-200',
                                  matchIdx % 2 === 0 ? 'top-0 left-0' : 'bottom-0 left-0',
                                )}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  p1,
  p2,
  userId,
  tournamentId,
  currentPrediction,
  actualPrediction,
  canMakePredictions,
  isAdmin,
  players,
  tournamentStatus,
  isFinalRound,
  onPredict,
}: {
  match: BracketMatch;
  p1: any;
  p2: any;
  userId: number;
  tournamentId: number;
  currentPrediction: { winnerId: number; score?: string } | undefined;
  actualPrediction: { winnerId: number; score?: string } | undefined;
  canMakePredictions: boolean;
  isAdmin?: boolean;
  players?: Player[];
  tournamentStatus?: string;
  isFinalRound?: boolean;
  onPredict: (winnerId: number, score?: string) => void;
}) {
  const isCompleted = match.status === 'completed';
  const isDraft = tournamentStatus === 'draft';
  const isPublished = tournamentStatus === 'active' || tournamentStatus === 'published';
  const isLocked = tournamentStatus === 'finished' || tournamentStatus === 'completed';
  const canPredict = canMakePredictions && !isCompleted && p1?.id && p2?.id;

  const selectedWinnerId = currentPrediction?.winnerId;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full transition-all hover:shadow-md hover:-translate-y-0.5 group">
      {isAdmin && isDraft && match.round === 1 ? (
        <SetPlayersDialog
          match={match}
          players={players || []}
          tournamentId={tournamentId}
          trigger={
            <div className="cursor-pointer">
              <PlayerRow
                name={p1?.name || null}
                seed={p1?.seed || null}
                type={p1?.type}
                isWinner={match.winner_id === p1?.id && isCompleted}
                isSelected={selectedWinnerId === p1?.id}
                isPredicted={actualPrediction?.winnerId === p1?.id}
                isCompleted={isCompleted}
                onSelect={() => {}}
                canPredict={false}
                score={match.score}
                isP1={true}
                isAdmin={true}
                isPlaceholder={!p1?.id && p1?.type !== 'PLAYER' && p1?.type !== 'BYE'}
              />
            </div>
          }
        />
      ) : (
        <PlayerRow
          name={p1?.name || null}
          seed={p1?.seed || null}
          type={p1?.type}
          isWinner={match.winner_id === p1?.id && isCompleted}
          isSelected={selectedWinnerId === p1?.id}
          isPredicted={actualPrediction?.winnerId === p1?.id}
          isCompleted={isCompleted}
          onSelect={() => p1?.id && onPredict(p1.id)}
          canPredict={!!canPredict}
          score={match.score}
          isP1={true}
          isPlaceholder={!p1?.id && p1?.type !== 'BYE' && p1?.type !== 'PLAYER'}
        />
      )}

      <div className="h-[1px] bg-slate-50 mx-4" />

      {isAdmin && isDraft && match.round === 1 ? (
        <SetPlayersDialog
          match={match}
          players={players || []}
          tournamentId={tournamentId}
          trigger={
            <div className="cursor-pointer">
              <PlayerRow
                name={p2?.name || null}
                seed={p2?.seed || null}
                type={p2?.type}
                isWinner={match.winner_id === p2?.id && isCompleted}
                isSelected={selectedWinnerId === p2?.id}
                isPredicted={actualPrediction?.winnerId === p2?.id}
                isCompleted={isCompleted}
                onSelect={() => {}}
                canPredict={false}
                score={match.score}
                isP1={false}
                isAdmin={true}
                isPlaceholder={!p2?.id && p2?.type !== 'PLAYER' && p2?.type !== 'BYE'}
              />
            </div>
          }
        />
      ) : (
        <PlayerRow
          name={p2?.name || null}
          seed={p2?.seed || null}
          type={p2?.type}
          isWinner={match.winner_id === p2?.id && isCompleted}
          isSelected={selectedWinnerId === p2?.id}
          isPredicted={actualPrediction?.winnerId === p2?.id}
          isCompleted={isCompleted}
          onSelect={() => p2?.id && onPredict(p2.id)}
          canPredict={!!canPredict}
          score={match.score}
          isP1={false}
          isPlaceholder={!p2?.id && p2?.type !== 'BYE' && p2?.type !== 'PLAYER'}
        />
      )}

      {isFinalRound && canMakePredictions && selectedWinnerId && (
        <div className="px-4 py-3 bg-blue-50/30 border-t border-slate-50 flex flex-col gap-2">
           <Label className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Placar da Final (Tie-break)</Label>
           <input
              type="text"
              placeholder="Ex: 3-1"
              value={currentPrediction?.score || ''}
              onChange={(e) => onPredict(selectedWinnerId, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
        </div>
      )}

      {isAdmin && !isLocked && !isCompleted && match.player1_id && match.player2_id && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-center">
          {isPublished ? (
            <SetResultDialog
              match={match}
              tournamentId={tournamentId}
              isFinalRound={isFinalRound}
            />
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              Publique para lançar resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  name,
  seed,
  type,
  isWinner,
  isSelected,
  isPredicted,
  isCompleted,
  onSelect,
  canPredict,
  score,
  isP1,
  isAdmin = false,
  isPlaceholder = false,
}: {
  name: string | null;
  seed: number | null;
  type?: string;
  isWinner: boolean;
  isSelected: boolean;
  isPredicted: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  canPredict: boolean;
  score: string | null;
  isP1: boolean;
  isAdmin?: boolean;
  isPlaceholder?: boolean;
}) {
  const displayName = name || (
    type === 'QUALIFIER' ? 'Qualifier' :
    type === 'WILDCARD' ? 'Wild Card' :
    type === 'BYE' ? 'BYE' :
    null
  );

  if (!displayName) {
    return (
      <div className={cn(
        "flex items-center justify-between px-4 py-3 min-h-[48px]",
        isAdmin && "hover:bg-slate-50 transition-colors"
      )}>
        <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">A definir</span>
        {isAdmin && <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    );
  }

  const sets = score ? score.split(' ') : [];
  const showPredictionResult = isCompleted && isPredicted;
  const predictionCorrect = showPredictionResult && isWinner;

  const getIndicator = () => {
    if (isPlaceholder) return null;
    if (type === 'SEED' && seed) return `(${seed})`;
    if (type === 'QUALIFIER') return '(Q)';
    if (type === 'WILDCARD') return '(WC)';
    return null;
  };

  const indicator = getIndicator();

  return (
    <div
      onClick={canPredict ? onSelect : undefined}
      className={cn(
        'flex items-center px-4 py-3 cursor-default transition-all relative min-h-[48px]',
        canPredict && 'cursor-pointer hover:bg-emerald-50/40',
        isSelected && !isCompleted && 'bg-blue-50/60',
        showPredictionResult && (predictionCorrect ? 'bg-emerald-50/80' : 'bg-red-50/80'),
        isAdmin && !isCompleted && 'hover:bg-slate-50',
        isPlaceholder && 'text-amber-600 italic font-bold'
      )}
    >
      {(isSelected || showPredictionResult) && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-r-full shadow-[0_0_8px_rgba(0,0,0,0.1)]',
            predictionCorrect ? 'bg-emerald-500' : showPredictionResult ? 'bg-red-500' : 'bg-blue-500',
          )}
        />
      )}

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={cn(
            'text-xs font-black truncate tracking-tight',
            isWinner ? 'text-slate-900' : 'text-slate-600',
            isSelected && !isCompleted && 'text-blue-900',
            showPredictionResult && (predictionCorrect ? 'text-emerald-900' : 'text-red-900'),
            isPlaceholder && 'text-amber-600'
          )}
        >
          {displayName}
        </span>
        {indicator && <span className="text-[9px] font-black text-slate-400">{indicator}</span>}
        {isAdmin && !isCompleted && (
          <Pencil className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {sets.length > 0 && (
        <div className="flex items-center gap-1.5 ml-3">
          {sets.map((set, i) => {
            const parts = set.split('-');
            const setScore = isP1 ? parts[0] : parts[1];
            const opponentScore = isP1 ? parts[1] : parts[0];
            const isSetWinner = parseInt(setScore) > parseInt(opponentScore);

            return (
              setScore !== undefined && (
                <div
                  key={i}
                  className={cn(
                    'w-5 h-6 flex items-center justify-center text-[10px] font-black rounded-sm shadow-sm',
                    isSetWinner ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100',
                  )}
                >
                  {setScore}
                </div>
              )
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center w-6 ml-2 shrink-0">
        {isSelected && !isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 animate-in zoom-in duration-200">
            <Check className="w-3 h-3 text-white" />
          </div>
        ) : isWinner ? (
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-100">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        ) : showPredictionResult && !predictionCorrect ? (
          <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center shadow-lg shadow-amber-100">
            <X className="w-3 h-3 text-white" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
