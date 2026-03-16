'use client';

import React, { useRef, useState, useTransition } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import { makePredictionAction } from '@/lib/actions/predictions';
import { Check, Trophy, X, Pencil, AlertCircle, Layout, User as UserIcon, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetPlayersDialog, ReplaceMatchPlayerDialog, SetResultDialog } from '@/components/admin/match-dialogs';
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
  assignedPlayerIds?: number[];
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
  assignedPlayerIds,
}: TournamentBracketProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [localPredictions, setLocalPredictions] =
    useState<Record<number, { winnerId: number; score?: string }>>(predictions);
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

  const isFinishedTournament =
    tournamentStatus === 'FINISHED' || tournamentStatus === 'finished' || tournamentStatus === 'completed';
console.log(tournamentStatus)

  const [selectedRound, setSelectedRound] = useState<number>(isFinishedTournament ? maxRound : rounds[0] || 1);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [viewMode, setViewMode] = useState<'official' | 'predictions'>(hasStarted ? 'official' : 'predictions');

  const handleRoundSelect = (round: number) => {
    const currentIndex = rounds.indexOf(selectedRound);
    const nextIndex = rounds.indexOf(round);

    if (nextIndex > currentIndex) {
      setDirection('right');
    } else if (nextIndex < currentIndex) {
      setDirection('left');
    }

    setSelectedRound(round);
  };

  // Map of player ID to player details for display in predicted rounds
  const playersById: Record<number, { name: string; seed: number | null; type: string }> = {};
  for (const m of matches) {
    if (m.player1_id) playersById[m.player1_id] = { name: m.player1_name!, seed: m.player1_seed, type: m.player1_type };
    if (m.player2_id) playersById[m.player2_id] = { name: m.player2_name!, seed: m.player2_seed, type: m.player2_type };
  }

  function handlePrediction(matchId: number, winnerId: number, score?: string) {
    if (!canMakePredictions) return;

    setLocalPredictions((prev) => {
      const next = { ...prev };
      next[matchId] = { winnerId, score: score ?? prev[matchId]?.score };

      // Cascade: If we change a winner, we must clear any predictions in subsequent rounds
      // that depended on the old winner of this match.
      const match = matches.find((m) => m.id === matchId);
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
        score: data.score,
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
    return matches.every((m) => {
      // Only require predictions for matches that have both players determined
      const p1 = playersById[m.player1_id!];
      const p2 = playersById[m.player2_id!];
      if (!p1 || !p2) return true; // Skip matches without both players set
      return !!localPredictions[m.id]?.winnerId;
    });
  };

  const CARD_HEIGHT = isAdmin ? 130 : 105;
  const BASE_GAP = isAdmin ? 30 : 1;

  return (
    <div className="flex flex-col gap-6">
      {viewMode === 'predictions' && canMakePredictions && (
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
              'px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg',
              isBracketComplete()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none',
            )}
          >
            {isSaving ? 'Salvando...' : 'Concluir Palpite'}
          </button>
        </div>
      )}

      {viewMode === 'predictions' && bracketSubmitted && !hasStarted && (
        <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
          <Check className="w-6 h-6 text-blue-500" />
          <p className="font-bold text-blue-900">
            Seu palpite foi registrado com sucesso! Você poderá alterá-lo até o início do torneio.
          </p>
        </div>
      )}

      {/* Sticky Header with Toggles and Filters */}
      <div className="sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md py-4 rounded-[2rem] border border-slate-200/50 shadow-sm px-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* View Mode Toggle */}
        {!isAdmin && (
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex gap-1 shrink-0">
            <button
              onClick={() => setViewMode('official')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                viewMode === 'official' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50',
              )}
            >
              <Layout className="w-3 h-3" />
              Oficial
            </button>
            <button
              onClick={() => setViewMode('predictions')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                viewMode === 'predictions' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50',
              )}
            >
              <UserIcon className="w-3 h-3" />
              Meu Palpite
            </button>
          </div>
        )}

        <div className="h-[1px] w-full bg-slate-200 md:hidden" />

        {/* Round Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-full py-5 px-5">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => handleRoundSelect(round)}
              className={cn(
                'px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0',
                selectedRound === round
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105'
                  : 'bg-white text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200',
              )}
            >
              {roundNames[round] || `R${round}`}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-[#f8fafc] rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto p-8 md:p-12 relative scrollbar-hide">
          <div
            key={selectedRound}
            className={cn(
              'flex gap-24 relative pb-20 min-w-max justify-center animate-in fade-in duration-500',
              direction === 'right'
                ? 'slide-in-from-right-8'
                : direction === 'left'
                  ? 'slide-in-from-left-8'
                  : 'slide-in-from-bottom-4',
            )}
          >
            {rounds
              .filter((r) => r === selectedRound || r === rounds[rounds.indexOf(selectedRound) + 1])
              .map((round) => {
                const roundIdx = rounds.indexOf(round);
                const isFinalRound = roundIdx === rounds.length - 1;
                const relativeIdx = roundIdx - rounds.indexOf(selectedRound);
                const hasNextVisibleRound = rounds.indexOf(selectedRound) + 1 < rounds.length;

                const multiplier = Math.pow(2, relativeIdx);
                const verticalGap = multiplier === 1 ? BASE_GAP : multiplier * (CARD_HEIGHT + BASE_GAP) - CARD_HEIGHT;
                const paddingTop = multiplier === 1 ? 0 : ((multiplier - 1) * (CARD_HEIGHT + BASE_GAP)) / 2;

                return (
                  <div key={round} className="flex flex-col w-[300px] relative z-10">
                    <div className="text-center mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 inline-block px-6 py-2 rounded-full border border-emerald-100">
                        {roundNames[round] === 'F'
                          ? 'Final'
                          : roundNames[round] === 'SF'
                            ? 'Semifinais'
                            : roundNames[round] === 'QF'
                              ? 'Quartas de Final'
                              : roundNames[round] || `Rodada ${round}`}
                      </h3>
                    </div>

                    <div
                      className="flex flex-col flex-1"
                      style={{
                        gap: `${verticalGap}px`,
                        paddingTop: `${paddingTop}px`,
                      }}
                    >
                      {Array.from({ length: Math.pow(2, maxRound - round) }).map((_, matchIdx) => {
                        const position = matchIdx + 1;
                        const match = matchesMap[`${round}-${position}`];

                        if (!match) {
                          return (
                            <div
                              key={`missing-${round}-${position}`}
                              className="relative flex items-center"
                              style={{ height: `${CARD_HEIGHT}px` }}
                            >
                              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl w-full p-4 flex flex-col items-center justify-center text-rose-600 gap-1 shadow-sm">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-center">
                                  Confronto ausente
                                </p>
                                <p className="text-[8px] font-bold text-center opacity-70">ERRO DE CHAVEAMENTO</p>
                              </div>
                            </div>
                          );
                        }

                        let p1 = null;
                        let p2 = null;

                        if (viewMode === 'predictions' || match.round === 1 || isAdmin) {
                          if (match.round === 1 || isAdmin) {
                            p1 = {
                              id: match.player1_id,
                              name: match.player1_name,
                              seed: match.player1_seed,
                              type: match.player1_type,
                            };
                            p2 = {
                              id: match.player2_id,
                              name: match.player2_name,
                              seed: match.player2_seed,
                              type: match.player2_type,
                            };
                          } else {
                            const prevRound = match.round - 1;
                            const m1 = matchesMap[`${prevRound}-${match.position * 2 - 1}`];
                            const m2 = matchesMap[`${prevRound}-${match.position * 2}`];

                            const pred1 = localPredictions[m1?.id]?.winnerId;
                            const pred2 = localPredictions[m2?.id]?.winnerId;

                            // In predictions mode, prioritize the user's prediction from previous round
                            // But fallback to official player if user hasn't predicted yet (e.g. BYE or partial bracket)
                            if (pred1) {
                              p1 = { id: pred1, ...playersById[pred1] };
                            } else if (match.player1_id) {
                              p1 = {
                                id: match.player1_id,
                                name: match.player1_name,
                                seed: match.player1_seed,
                                type: match.player1_type,
                              };
                            }

                            if (pred2) {
                              p2 = { id: pred2, ...playersById[pred2] };
                            } else if (match.player2_id) {
                              p2 = {
                                id: match.player2_id,
                                name: match.player2_name,
                                seed: match.player2_seed,
                                type: match.player2_type,
                              };
                            }
                          }
                        } else {
                          // Official view
                          p1 = match.player1_id
                            ? {
                                id: match.player1_id,
                                name: match.player1_name,
                                seed: match.player1_seed,
                                type: match.player1_type,
                              }
                            : { isAwaiting: true };
                          p2 = match.player2_id
                            ? {
                                id: match.player2_id,
                                name: match.player2_name,
                                seed: match.player2_seed,
                                type: match.player2_type,
                              }
                            : { isAwaiting: true };
                        }

                        return (
                          <div
                            key={match.id}
                            className="relative flex items-center"
                            style={{ height: `${CARD_HEIGHT}px` }}
                          >
                            <BracketMatchCard
                              match={match}
                              p1={p1}
                              p2={p2}
                              userId={userId}
                              tournamentId={tournamentId}
                              currentPrediction={localPredictions[match.id]}
                              actualPrediction={predictions[match.id]}
                              canMakePredictions={canMakePredictions && viewMode === 'predictions'}
                              isAdmin={isAdmin}
                              players={players}
                              tournamentStatus={tournamentStatus}
                              isFinalRound={isFinalRound}
                              onPredict={(winnerId, score) => handlePrediction(match.id, winnerId, score)}
                              assignedPlayerIds={assignedPlayerIds}
                              viewMode={viewMode}
                            />

                            {relativeIdx === 0 && hasNextVisibleRound && (
                              <div
                                className="absolute -right-24 top-1/2 w-24 pointer-events-none"
                                style={{
                                  height: `${verticalGap / 2 + CARD_HEIGHT / 2}px`,
                                  top: matchIdx % 2 === 0 ? '50%' : 'auto',
                                  bottom: matchIdx % 2 === 0 ? 'auto' : '50%',
                                }}
                              >
                                {/* Horizontal line from current match to center of gap */}
                                <div
                                  className={cn(
                                    'absolute w-1/2 h-[2px] bg-slate-200',
                                    matchIdx % 2 === 0 ? 'top-0 left-0' : 'bottom-0 left-0',
                                  )}
                                />

                                {/* Vertical line in the center of gap */}
                                <div className="absolute w-[2px] bg-slate-200 left-1/2 top-0 bottom-0" />

                                {/* Horizontal line from center of gap to next match */}
                                {matchIdx % 2 === 0 && (
                                  <div className="absolute w-1/2 h-[2px] bg-slate-200 right-0 bottom-0" />
                                )}
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
  assignedPlayerIds,
  viewMode = 'predictions',
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
  assignedPlayerIds?: number[];
  viewMode?: 'official' | 'predictions';
}) {
  const isCompleted = match.status === 'completed';
  const isDraft =
    tournamentStatus === 'draft' ||
    tournamentStatus === 'STANDBY' ||
    tournamentStatus === 'UPCOMING' ||
    tournamentStatus === 'upcoming';
  const isPublished =
    tournamentStatus === 'active' ||
    tournamentStatus === 'published' ||
    tournamentStatus === 'OPEN' ||
    tournamentStatus === 'LOCKED' ||
    tournamentStatus === 'IN_PROGRESS';
  const isLocked =
    tournamentStatus === 'finished' || tournamentStatus === 'completed' || tournamentStatus === 'FINISHED';
  const canPredict = canMakePredictions && !isCompleted && p1?.id && p2?.id;
  const canEditPlayers = isAdmin && isDraft && match.round === 1;

  const selectedWinnerId = currentPrediction?.winnerId;

  // Logic to determine if a player in the user's bracket is "incorrect" based on official results
  // A player is incorrect if they officially lost a previous round (thus not reaching this match)
  // or if they lost this match officially.
  const isP1Incorrect =
    viewMode === 'predictions' &&
    ((match.player1_id && p1?.id && match.player1_id !== p1.id) ||
      (match.winner_id && p1?.id && match.winner_id !== p1.id && isCompleted));
  const isP2Incorrect =
    viewMode === 'predictions' &&
    ((match.player2_id && p2?.id && match.player2_id !== p2.id) ||
      (match.winner_id && p2?.id && match.winner_id !== p2.id && isCompleted));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full transition-all hover:shadow-md hover:-translate-y-0.5 group">
      {canEditPlayers ? (
        <SetPlayersDialog
          match={match}
          players={players || []}
          tournamentId={tournamentId}
          assignedPlayerIds={assignedPlayerIds}
          trigger={
            <div className="cursor-pointer group">
              <PlayerRow
                name={p1?.name || null}
                seed={p1?.seed || null}
                type={p1?.type}
                isWinner={match.winner_id === p1?.id && isCompleted}
                isSelected={selectedWinnerId === p1?.id}
                isPredicted={selectedWinnerId === p1?.id}
                isCompleted={isCompleted}
                onSelect={() => {}}
                canPredict={false}
                score={match.score}
                isP1={true}
                isAdmin={true}
                isPlaceholder={!p1?.id && p1?.type !== 'PLAYER' && p1?.type !== 'BYE'}
                pointsCancelled={match.points_cancelled}
                viewMode={viewMode}
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
          isPredicted={selectedWinnerId === p1?.id}
          isCompleted={isCompleted}
          onSelect={() => p1?.id && onPredict(p1.id)}
          canPredict={!!canPredict}
          score={match.score}
          isP1={true}
          isPlaceholder={(!p1?.id && p1?.type !== 'BYE' && p1?.type !== 'PLAYER') || p1?.isAwaiting}
          pointsCancelled={match.points_cancelled}
          isAwaiting={p1?.isAwaiting}
          viewMode={viewMode}
          isForceIncorrect={isP1Incorrect}
        />
      )}

      <div className="h-[1px] bg-slate-50 mx-4" />

      {canEditPlayers ? (
        <SetPlayersDialog
          match={match}
          players={players || []}
          tournamentId={tournamentId}
          assignedPlayerIds={assignedPlayerIds}
          trigger={
            <div className="cursor-pointer group">
              <PlayerRow
                name={p2?.name || null}
                seed={p2?.seed || null}
                type={p2?.type}
                isWinner={match.winner_id === p2?.id && isCompleted}
                isSelected={selectedWinnerId === p2?.id}
                isPredicted={selectedWinnerId === p2?.id}
                isCompleted={isCompleted}
                onSelect={() => {}}
                canPredict={false}
                score={match.score}
                isP1={false}
                isAdmin={true}
                isPlaceholder={!p2?.id && p2?.type !== 'PLAYER' && p2?.type !== 'BYE'}
                pointsCancelled={match.points_cancelled}
                viewMode={viewMode}
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
          isPredicted={selectedWinnerId === p2?.id}
          isCompleted={isCompleted}
          onSelect={() => p2?.id && onPredict(p2.id)}
          canPredict={!!canPredict}
          score={match.score}
          isP1={false}
          isPlaceholder={(!p2?.id && p2?.type !== 'BYE' && p2?.type !== 'PLAYER') || p2?.isAwaiting}
          pointsCancelled={match.points_cancelled}
          isAwaiting={p2?.isAwaiting}
          viewMode={viewMode}
          isForceIncorrect={isP2Incorrect}
        />
      )}

      {isFinalRound && canMakePredictions && selectedWinnerId && (
        <div className="px-4 py-3 bg-blue-50/30 border-t border-slate-50 flex flex-col gap-2">
          <Label className="text-[9px] font-black uppercase text-blue-600 tracking-widest">
            Placar da Final (Tie-break)
          </Label>
          <input
            type="text"
            placeholder="Ex: 3-1"
            value={currentPrediction?.score || ''}
            onChange={(e) => onPredict(selectedWinnerId, e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {isAdmin && !isLocked && (
        <div className="px-2 pb-2">
          {isPublished && !isCompleted && (
            <div className="flex gap-2 mb-2">
              {/* Replace placeholder OR replace existing player in Round 1 */}
              {(match.round === 1 ||
                ((match.player1_type === 'QUALIFIER' ||
                  match.player1_type === 'WILDCARD' ||
                  match.player1_type === 'LUCKY_LOSER') &&
                  !match.player1_id) ||
                ((match.player2_type === 'QUALIFIER' ||
                  match.player2_type === 'WILDCARD' ||
                  match.player2_type === 'LUCKY_LOSER') &&
                  !match.player2_id)) && (
                <ReplaceMatchPlayerDialog
                  match={match}
                  players={players || []}
                  tournamentId={tournamentId}
                  assignedPlayerIds={assignedPlayerIds}
                />
              )}
            </div>
          )}

          {match.player1_id && match.player2_id && (
            <div className="flex">
              {isPublished && <SetResultDialog match={match} tournamentId={tournamentId} isFinalRound={isFinalRound} />}
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
  pointsCancelled = false,
  isAwaiting = false,
  viewMode = 'predictions',
  isForceIncorrect = false,
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
  pointsCancelled?: boolean;
  isAwaiting?: boolean;
  viewMode?: 'official' | 'predictions';
}) {
  const displayName = isAwaiting
    ? 'Aguardando resultados'
    : name ||
      (type === 'QUALIFIER'
        ? 'Qualifier'
        : type === 'WILDCARD'
          ? 'Wild Card'
          : type === 'LUCKY_LOSER'
            ? 'Lucky Loser'
            : type === 'BYE'
              ? 'BYE'
              : null);

  if (!displayName) {
    return (
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 min-h-[48px]',
          isAdmin && 'hover:bg-slate-50 transition-colors',
        )}
      >
        <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">A definir</span>
        {isAdmin && <Pencil className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    );
  }

  const sets = score ? score.split(' ') : [];
  const showPredictionResult = (isCompleted && isPredicted) || (isPredicted && isForceIncorrect);
  const predictionCorrect = showPredictionResult && isWinner && !isForceIncorrect;

  const getIndicator = () => {
    if (isPlaceholder) return null;
    if (type === 'SEED' && seed) return `(${seed})`;
    if (type === 'QUALIFIER') return '(Q)';
    if (type === 'WILDCARD') return '(WC)';
    if (type === 'LUCKY_LOSER') return '(LL)';
    return null;
  };

  const indicator = getIndicator();

  function formatName(name: string) {
    const parts = name.trim().split(' ');

    if (parts.length === 1) return name;

    if (parts.length === 2) {
      return `${parts[0][0]}. ${parts[1]}`;
    }

    const firstInitial = parts[0][0];
    const lastName = parts[parts.length - 1];

    return `${firstInitial}. ${lastName}`;
  }

  return (
    <div
      onClick={canPredict ? onSelect : undefined}
      className={cn(
        'flex items-center px-4 py-3 cursor-default transition-all relative min-h-[48px]',
        canPredict && 'cursor-pointer hover:bg-emerald-50/40',
        isSelected && !isCompleted && viewMode === 'predictions' && 'bg-blue-50/60',
        showPredictionResult && viewMode === 'predictions' && (predictionCorrect ? 'bg-emerald-50/80' : 'bg-red-50/80'),
        isAdmin && !isCompleted && 'hover:bg-slate-50',
        isPlaceholder && 'text-amber-600 italic font-bold',
        isAwaiting && 'opacity-60',
      )}
    >
      {(isSelected || showPredictionResult) && viewMode === 'predictions' && (
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
            isSelected && !isCompleted && viewMode === 'predictions' && 'text-blue-900',
            showPredictionResult &&
              viewMode === 'predictions' &&
              (predictionCorrect ? 'text-emerald-900' : 'text-red-900'),
            isPlaceholder && 'text-amber-600',
            isAwaiting && 'text-slate-400 font-bold uppercase tracking-widest text-[10px]',
          )}
        >
          {formatName(displayName)}
        </span>
        {indicator && <span className="text-[9px] font-black text-slate-400">{indicator}</span>}
        {isAdmin && !isCompleted && (
          <Pencil className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {showPredictionResult && pointsCancelled && (
          <div className="ml-2 bg-red-500 text-white text-[8px] font-black h-4 px-1 flex items-center rounded-sm">
            ANULADA
          </div>
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
              setScore !== undefined &&
              viewMode !== 'predictions' && (
                <React.Fragment key={i}>
                  <div
                    className={cn(
                      'w-5 h-6 flex items-center justify-center text-[10px] font-black',
                      isSetWinner ? 'text-emerald-500' : 'text-slate-400',
                    )}
                  >
                    {setScore}
                  </div>

                  {i < sets.length - 1 && <span className="text-slate-400 font-black text-[10px]">-</span>}
                </React.Fragment>
              )
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 ml-2 shrink-0 min-w-[24px]">
        {viewMode === 'predictions' ? (
          isSelected && !isCompleted ? (
            !predictionCorrect ? (
              <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center shadow-lg shadow-amber-100">
                <X className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 animate-in zoom-in duration-200">
                <Clock className="w-5 h-5 text-white" />
              </div>
            )
          ) : isWinner ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : null
        ) : (
          /* Official Mode Indicators */
          <>
            {isWinner && (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
