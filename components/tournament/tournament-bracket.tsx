'use client';

import React, { useRef, useState, useTransition, useEffect } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import { getFlagUrl } from '@/lib/countries';
import { saveFullBracketAction } from '@/lib/actions/predictions';
import { Check, Trophy, X, Pencil, AlertCircle, Layout, User as UserIcon, ArrowRight, Clock, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AdminMatchActions } from '@/components/admin/admin-match-actions';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

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
  tournamentCategory?: string;
  bracketSubmitted?: boolean;
  hasStarted?: boolean;
  assignedPlayerIds?: number[];
  isEnrolled?: boolean;
  isViewingOthers?: boolean;
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
  tournamentCategory = 'GRAND_SLAM',
  bracketSubmitted = false,
  hasStarted = false,
  assignedPlayerIds,
  isEnrolled = false,
  isViewingOthers = false,
}: TournamentBracketProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [localPredictions, setLocalPredictions] =
    useState<Record<number, { winnerId: number; score?: string }>>(predictions);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isTransitioning, startTransition] = useTransition();

  // Debounce saving predictions
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedRound, layoutMode]);

  // Debounce saving predictions
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    if (!canMakePredictions) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const predictionArray = Object.entries(localPredictions).map(([matchId, data]) => ({
          matchId: parseInt(matchId),
          winnerId: data.winnerId,
          score: data.score,
        }));

        await saveFullBracketAction(userId, tournamentId, predictionArray);
        toast.success('Palpite salvo com sucesso!');
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Ocorreu um erro ao salvar seu palpite. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [localPredictions, userId, tournamentId, canMakePredictions]);

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

  const [selectedRound, setSelectedRound] = useState<number | 'all'>(isFinishedTournament ? maxRound : rounds[0] || 1);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [viewMode, setViewMode] = useState<'official' | 'predictions'>(
    isViewingOthers ? 'predictions' : (hasStarted || !isEnrolled ? 'official' : 'predictions')
  );
  const [layoutMode, setLayoutMode] = useState<'zoom' | 'full'>('zoom');
  const router = useRouter();

  const isFinalPredicted = !!localPredictions[matches.find((m) => m.round === maxRound)?.id || -1]?.winnerId;

  // Track officially eliminated players and the round they lost to highlight incorrect predictions early
  const playerEliminatedInRound = new Map<number, number>();
  const allOfficialPlayerIds = new Set<number>();

  for (const m of matches) {
    if (m.player1_id) allOfficialPlayerIds.add(m.player1_id);
    if (m.player2_id) allOfficialPlayerIds.add(m.player2_id);

    if (m.status === 'completed' && m.winner_id) {
      const loserId = m.player1_id === m.winner_id ? m.player2_id : m.player1_id;
      if (loserId) playerEliminatedInRound.set(loserId, m.round);
    }
  }

  const handleRoundSelect = (round: number | 'all') => {
    if (round === 'all') {
      setLayoutMode('full');
      setSelectedRound('all');
      return;
    }

    setLayoutMode('zoom');
    const currentIndex = selectedRound === 'all' ? -1 : rounds.indexOf(selectedRound);
    const nextIndex = rounds.indexOf(round);

    if (nextIndex > currentIndex) {
      setDirection('right');
    } else if (nextIndex < currentIndex) {
      setDirection('left');
    }

    setSelectedRound(round);
  };

  const handleFinalize = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    try {
      const predictionArray = Object.entries(localPredictions).map(([matchId, data]) => ({
        matchId: parseInt(matchId),
        winnerId: data.winnerId,
        score: data.score,
      }));

      await saveFullBracketAction(userId, tournamentId, predictionArray);
      toast.success('Palpite salvo com sucesso!');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Ocorreu um erro ao salvar seu palpite. Tente novamente.');
      setIsFinalizing(false);
    }
  };

  // Map of player ID to player details for display in predicted rounds
  const playersById: Record<
    number,
    { name: string; display_name: string | null; seed: number | null; type: string; country: string | null }
  > = {};
  for (const m of matches) {
    if (m.player1_id)
      playersById[m.player1_id] = {
        name: m.player1_name!,
        display_name: m.player1_display_name,
        seed: m.player1_seed,
        type: m.player1_type,
        country: m.player1_country,
      };
    if (m.player2_id)
      playersById[m.player2_id] = {
        name: m.player2_name!,
        display_name: m.player2_display_name,
        seed: m.player2_seed,
        type: m.player2_type,
        country: m.player2_country,
      };
  }

  function handlePrediction(matchId: number, winnerId: number, score?: string, isFinal?: boolean, p1?: any, p2?: any) {
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

  const CARD_HEIGHT = 110;
  const BASE_GAP = 24;

  return (
    <div className="flex flex-col gap-6">
      {/* Sticky Header with Toggles and Filters */}
      <div className="sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md py-1 rounded-[2rem] border border-slate-200/50 shadow-sm px-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* View Mode Toggle */}
        {!isAdmin && (isEnrolled || isViewingOthers) && (
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
              {isViewingOthers ? 'Ver Palpite' : 'Meu Palpite'}
            </button>
          </div>
        )}

        <div className="h-[1px] w-full bg-slate-200 md:hidden" />

        {/* Round Filter */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide max-w-full py-5 px-5 z-50">
          <button
            onClick={() => handleRoundSelect('all')}
            className={cn(
              'px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border',
              selectedRound === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 hover:text-emerald-600 border-slate-200 hover:border-emerald-200'
            )}
          >
            Ver Tudo
          </button>
          <div className="w-[1px] h-6 bg-slate-200 shrink-0" />
          <div className="flex items-center gap-3">
            {rounds.map((round) => (
              <button
                key={round}
                onClick={() => handleRoundSelect(round)}
                className={cn(
                  'w-12 h-12 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tighter transition-all shrink-0 border-2',
                  selectedRound === round
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 bg-white'
                )}
              >
                {roundNames[round] || `R${round}`}
              </button>
            ))}
          </div>
        </div>

        {/* Finalizar Button */}
        {viewMode === 'predictions' && !hasStarted && isFinalPredicted && (
          <button
            onClick={handleFinalize}
            disabled={isFinalizing}
            className={cn(
              'flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 transition-all animate-in fade-in slide-in-from-right-4',
              isFinalizing
                ? 'opacity-80 cursor-not-allowed'
                : 'hover:bg-emerald-700 hover:-translate-y-1',
            )}
          >
            {isFinalizing ? (
              <>
                Salvando...
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Finalizar
                <LogOut className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>



      <div className="w-full bg-[#f8fafc] rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 blur-[3px] pointer-events-none brightness-75"
          style={{
            backgroundImage: `url("https://i.cbc.ca/ais/b11cff07-3bac-4bd3-b3bd-2f7714560c84,1769517092924/full/max/0/default.jpg?im=Crop,rect=(0,146,3401,1913);")`,
           }}
        />
        <div
          ref={scrollContainerRef}
          className={cn(
            "overflow-y-auto relative scrollbar-hide max-h-[70vh] md:max-h-[75vh]",
            layoutMode === 'full' ? "overflow-x-auto" : "overflow-x-hidden"
          )}
        >
          <div
            key={selectedRound}
            className={cn(
              'flex relative pb-20 justify-center animate-in fade-in duration-500 p-1 md:p-12 pt-0 transition-all',
              layoutMode === 'full' ? 'gap-12 md:gap-24 min-w-max' : 'gap-4 md:gap-12 w-full max-w-7xl mx-auto px-4',
              direction === 'right'
                ? 'slide-in-from-right-8'
                : direction === 'left'
                  ? 'slide-in-from-left-8'
                  : 'slide-in-from-bottom-4',
            )}
          >
            {rounds
              .filter((r) => {
                if (layoutMode === 'full') return true;
                const selIdx = rounds.indexOf(selectedRound as number);
                const rIdx = rounds.indexOf(r);
                return rIdx === selIdx || rIdx === selIdx + 1;
              })
              .map((round) => {
                const roundIdx = rounds.indexOf(round);
                const isFinalRound = roundIdx === rounds.length - 1;

                const isZoom = layoutMode === 'zoom';
                const relativeIdx = layoutMode === 'full' ? roundIdx : roundIdx - rounds.indexOf(selectedRound as number);

                const baseGap = isZoom ? 64 : BASE_GAP;
                const multiplier = Math.pow(2, relativeIdx);
                const verticalGap = multiplier === 1 ? baseGap : multiplier * (CARD_HEIGHT + baseGap) - CARD_HEIGHT;
                const paddingTop = multiplier === 1 ? 0 : ((multiplier - 1) * (CARD_HEIGHT + baseGap)) / 2;

                return (
                  <div
                    key={round}
                    className={cn(
                      'flex flex-col relative z-10 transition-all duration-500',
                      layoutMode === 'full' ? 'w-[280px] md:w-[300px]' : 'w-[280px] md:w-[320px] shrink-0',
                    )}
                  >
                    <div className="sticky top-0 md:pt-3 pt-10 z-30 flex flex-col items-center gap-2 m-auto">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 inline-block px-6 py-2 rounded-full border border-emerald-100 shadow-sm">
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
                              display_name: match.player1_display_name,
                              seed: match.player1_seed,
                              type: match.player1_type,
                              country: match.player1_country,
                            };
                            p2 = {
                              id: match.player2_id,
                              name: match.player2_name,
                              display_name: match.player2_display_name,
                              seed: match.player2_seed,
                              type: match.player2_type,
                              country: match.player2_country,
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
                            } else if (match.player1_id && (m1?.player1_type === 'BYE' || m1?.player2_type === 'BYE')) {
                              p1 = {
                                id: match.player1_id,
                                name: match.player1_name,
                                display_name: match.player1_display_name,
                                seed: match.player1_seed,
                                type: match.player1_type,
                                country: match.player1_country,
                              };
                            } else {
                              p1 = { isNotPredicted: true };
                            }

                            if (pred2) {
                              p2 = { id: pred2, ...playersById[pred2] };
                            } else if (match.player2_id && (m2?.player1_type === 'BYE' || m2?.player2_type === 'BYE')) {
                              p2 = {
                                id: match.player2_id,
                                name: match.player2_name,
                                display_name: match.player2_display_name,
                                seed: match.player2_seed,
                                type: match.player2_type,
                                country: match.player2_country,
                              };
                            } else {
                              p2 = { isNotPredicted: true };
                            }
                          }
                        } else {
                          // Official view
                          p1 = match.player1_id
                            ? {
                                id: match.player1_id,
                                name: match.player1_name,
                                display_name: match.player1_display_name,
                                seed: match.player1_seed,
                                type: match.player1_type,
                                country: match.player1_country,
                              }
                            : { isAwaiting: true };
                          p2 = match.player2_id
                            ? {
                                id: match.player2_id,
                                name: match.player2_name,
                                display_name: match.player2_display_name,
                                seed: match.player2_seed,
                                type: match.player2_type,
                                country: match.player2_country,
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
                              onPredict={(winnerId, score) => handlePrediction(match.id, winnerId, score, isFinalRound, p1, p2)}
                              assignedPlayerIds={assignedPlayerIds}
                              viewMode={viewMode}
                              playerEliminatedInRound={playerEliminatedInRound}
                              allOfficialPlayerIds={allOfficialPlayerIds}
                            />

                            {/* Left incoming lines (Alças) - only for the first visible column in zoom mode, or first round in full mode */}
                            {((layoutMode === 'zoom' && relativeIdx === 0 && round !== rounds[0]) || (layoutMode === 'full' && round === rounds[0])) && (
                              <div className="absolute -left-8 md:-left-14 top-0 bottom-0 w-8 md:w-14 pointer-events-none">
                                <div className="absolute left-1 md:left-4 top-[15%] bottom-[15%] w-[2px] bg-slate-200/60" />
                                <div className="absolute left-1 md:left-4 top-[15%] w-3 md:w-4 h-[2px] bg-slate-200/60" />
                                <div className="absolute left-1 md:left-4 bottom-[15%] w-3 md:w-4 h-[2px] bg-slate-200/60" />
                                <div className="absolute left-4 md:left-8 top-1/2 w-4 md:w-6 h-[2px] bg-slate-200/60 -translate-y-1/2" />
                              </div>
                            )}

                            {/* Connection lines to next round */}
                            {((layoutMode === 'full' && !isFinalRound) || (layoutMode === 'zoom' && relativeIdx === 0 && !isFinalRound)) && (
                              <div
                                className={cn(
                                  "absolute top-1/2 pointer-events-none",
                                  layoutMode === 'full' ? "-right-12 md:-right-24 w-12 md:w-24" : "-right-8 md:-right-20 w-8 md:w-20"
                                )}
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

                            {/* Outgoing "alça" for the last visible column in zoom mode if it's not the final */}
                            {layoutMode === 'zoom' && relativeIdx === 1 && !isFinalRound && (
                              <div className="absolute -right-8 md:-right-14 top-0 bottom-0 w-8 md:w-14 pointer-events-none">
                                <div className="absolute right-4 md:right-8 top-1/2 w-4 md:w-6 h-[2px] bg-slate-200/60 -translate-y-1/2" />
                                <div
                                  className={cn(
                                    "absolute right-4 md:right-8 w-[2px] bg-slate-200/60",
                                    matchIdx % 2 === 0 ? "top-1/2 h-[calc(50%+32px)]" : "bottom-1/2 h-[calc(50%+32px)]"
                                  )}
                                />
                                {matchIdx % 2 === 0 && (
                                  <div className="absolute right-0 bottom-[-32px] w-4 md:w-8 h-[2px] bg-slate-200/60" />
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
  playerEliminatedInRound,
  allOfficialPlayerIds,
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
  playerEliminatedInRound: Map<number, number>;
  allOfficialPlayerIds: Set<number>;
}) {
  const isCompleted = match.status === 'completed';
  const isFinishedTournament =
    tournamentStatus === 'FINISHED' || tournamentStatus === 'finished' || tournamentStatus === 'completed';
  const canPredict = canMakePredictions && !isCompleted && p1?.id && p2?.id;

  const selectedWinnerId = currentPrediction?.winnerId;

  // Logic to determine if a player in the user's bracket is "incorrect" based on official results
  const isP1Incorrect =
    viewMode === 'predictions' &&
    p1?.id &&
    ((match.player1_id && match.player1_id !== p1.id) ||
      (match.winner_id && match.winner_id !== p1.id && isCompleted) ||
      (playerEliminatedInRound.has(p1.id) && playerEliminatedInRound.get(p1.id)! <= match.round) ||
      (!allOfficialPlayerIds.has(p1.id) && p1.type !== 'BYE'));

  const isP2Incorrect =
    viewMode === 'predictions' &&
    p2?.id &&
    ((match.player2_id && match.player2_id !== p2.id) ||
      (match.winner_id && match.winner_id !== p2.id && isCompleted) ||
      (playerEliminatedInRound.has(p2.id) && playerEliminatedInRound.get(p2.id)! <= match.round) ||
      (!allOfficialPlayerIds.has(p2.id) && p2.type !== 'BYE'));

  const cardContent = (
    <>
      <PlayerRow
        name={p1?.name || null}
        display_name={p1?.display_name || null}
        seed={p1?.seed || null}
        type={p1?.type}
        country={p1?.country}
        isWinner={match.winner_id === p1?.id && isCompleted}
        isSelected={selectedWinnerId === p1?.id}
        isPredicted={selectedWinnerId === p1?.id}
        isCompleted={isCompleted}
        onSelect={() => p1?.id && onPredict(p1.id)}
        canPredict={!!canPredict}
        score={match.score}
        isP1={true}
        isPlaceholder={(!p1?.id && p1?.type !== 'BYE' && p1?.type !== 'PLAYER') || p1?.isAwaiting || p1?.isNotPredicted}
        pointsCancelled={match.points_cancelled}
        isAwaiting={p1?.isAwaiting}
        viewMode={viewMode}
        isForceIncorrect={isP1Incorrect}
        isNotPredicted={p1?.isNotPredicted}
        isAdmin={isAdmin}
        isFinishedTournament={isFinishedTournament}
      />

      <div className="h-[1px] bg-slate-50 mx-4" />

      <PlayerRow
        name={p2?.name || null}
        display_name={p2?.display_name || null}
        seed={p2?.seed || null}
        type={p2?.type}
        country={p2?.country}
        isWinner={match.winner_id === p2?.id && isCompleted}
        isSelected={selectedWinnerId === p2?.id}
        isPredicted={selectedWinnerId === p2?.id}
        isCompleted={isCompleted}
        onSelect={() => p2?.id && onPredict(p2.id)}
        canPredict={!!canPredict}
        score={match.score}
        isP1={false}
        isPlaceholder={(!p2?.id && p2?.type !== 'BYE' && p2?.type !== 'PLAYER') || p2?.isAwaiting || p2?.isNotPredicted}
        pointsCancelled={match.points_cancelled}
        isAwaiting={p2?.isAwaiting}
        viewMode={viewMode}
        isForceIncorrect={isP2Incorrect}
        isNotPredicted={p2?.isNotPredicted}
        isAdmin={isAdmin}
        isFinishedTournament={isFinishedTournament}
      />

    </>
  );

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full transition-all hover:shadow-md hover:-translate-y-0.5 group relative',
        (isAdmin || canPredict) && 'cursor-pointer',
        isAdmin && !isFinishedTournament && 'hover:border-emerald-200 hover:ring-2 hover:ring-emerald-50',
      )}
    >
      {isAdmin && !isFinishedTournament ? (
        <AdminMatchActions
          match={match}
          players={players || []}
          tournamentId={tournamentId}
          assignedPlayerIds={assignedPlayerIds}
          isFinalRound={isFinalRound}
          tournamentStatus={tournamentStatus}
          trigger={
            <div className="relative">
              {cardContent}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg shadow-emerald-200">
                  <Settings className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          }
        />
      ) : (
        cardContent
      )}
    </div>
  );
}

function PlayerRow({
  name,
  display_name,
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
  country = null,
  isNotPredicted,
  isFinishedTournament = false,
}: {
  name: string | null;
  display_name?: string | null;
  seed: number | null;
  type?: string;
  country?: string | null;
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
  isForceIncorrect?: boolean;
  isNotPredicted?: boolean;
  isFinishedTournament?: boolean;
}) {
  const displayName = isAwaiting
    ? 'Aguardando resultados'
    : isNotPredicted
      ? 'Não palpitado'
      : name ||
      (type === 'QUALIFIER'
        ? 'Qualifier'
        : type === 'WILDCARD'
          ? 'Wild Card'
          : type === 'LUCKY_LOSER'
            ? 'Lucky Loser'
          : type === 'NEXT_GEN'
            ? 'Next Gen'
            : type === 'ALT'
              ? 'Alternate'
            : type === 'BYE'
              ? 'BYE'
              : null);

  if (!displayName) {
    return (
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 min-h-[48px]',
          isAdmin && 'hover:bg-slate-50 transition-colors',
          viewMode === 'predictions' && 'text-red-400/70',
        )}
      >
        <span className="text-[10px] font-bold italic uppercase tracking-widest">
          {viewMode === 'predictions' ? 'Não palpitado' : 'A definir'}
        </span>
      </div>
    );
  }

  const sets = score ? score.split(' ') : [];
  const showPredictionResult = (isCompleted && isPredicted) || (isPredicted && isForceIncorrect);

  const displaySets = viewMode === 'predictions' && score && score.includes('-') && !score.includes(' ')
    ? [score]
    : sets;
  const predictionCorrect = showPredictionResult && isWinner && !isForceIncorrect;

  const getIndicator = () => {
    if (isPlaceholder) return null;
    if (type === 'SEED' && seed) return `(${seed})`;
    if (type === 'QUALIFIER') return '(Q)';
    if (type === 'WILDCARD') return '(WC)';
    if (type === 'LUCKY_LOSER') return '(LL)';
    if (type === 'NEXT_GEN') return '(NG)';
    if (type === 'ALT') return '(ALT)';
    return null;
  };

  const indicator = getIndicator();
  const flagUrl = getFlagUrl(country);

  return (
    <div
      onClick={canPredict ? onSelect : undefined}
      className={cn(
        'flex items-center px-4 py-3 transition-all relative min-h-[48px]',
        canPredict || (isAdmin && !isFinishedTournament) ? 'cursor-pointer' : 'cursor-default',
        canPredict && 'hover:bg-emerald-50/40',
        isSelected && !isCompleted && viewMode === 'predictions' && 'bg-blue-50/60',
        showPredictionResult && viewMode === 'predictions' && (predictionCorrect ? 'bg-emerald-50/80' : 'bg-red-50/80'),
        isAdmin && !isFinishedTournament && 'hover:bg-slate-50',
        isPlaceholder && 'text-amber-600 italic font-bold',
        isNotPredicted && 'text-red-400 font-bold opacity-70',
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

      <div className="flex-1 min-w-0 flex items-center">
        {flagUrl && (
          <img
            src={flagUrl}
            alt={country!}
            className="w-5 h-3.5 object-cover rounded-sm shadow-sm mr-2"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span
          className={cn(
            'text-xs font-black truncate tracking-tight pr-1',
            isWinner ? 'text-slate-900' : 'text-slate-600',
            isSelected && !isCompleted && viewMode === 'predictions' && 'text-blue-900',
            showPredictionResult &&
              viewMode === 'predictions' &&
              (predictionCorrect ? 'text-emerald-900' : 'text-red-900'),
            isPlaceholder && 'text-amber-600',
            isAwaiting && 'text-slate-400 font-bold uppercase tracking-widest text-[10px]',
          )}
        >
          {display_name || displayName}
        </span>
        {indicator && <span className="text-[9px] font-black text-slate-400">{indicator}</span>}
        {showPredictionResult && pointsCancelled && (
          <div className="ml-2 bg-red-500 text-white text-[8px] font-black h-4 px-1 flex items-center rounded-sm">
            ANULADA
          </div>
        )}
      </div>

      {displaySets.length > 0 && (
        <div className="flex items-center gap-1.5 ml-3">
          {displaySets.map((set, i) => {
            const parts = set.split('-');
            const setScore = isP1 ? parts[0] : parts[1];
            const opponentScore = isP1 ? parts[1] : parts[0];
            const isSetWinner = parseInt(setScore) > parseInt(opponentScore);

            return (
              setScore !== undefined && setScore !== "BYE" && (
                <React.Fragment key={i}>
                  <div
                    className={cn(
                      'w-5 h-6 flex items-center justify-center text-[10px] font-black',
                      isSetWinner ? 'text-emerald-500' : 'text-slate-400',
                    )}
                  >
                    {setScore}
                  </div>
                </React.Fragment>
              )
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 ml-2 shrink-0 min-w-[24px]">
        {viewMode === 'predictions' ? (
          isSelected && !isCompleted && !isForceIncorrect ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          ) : isWinner ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-500" />
            </div>
          ) : null
        ) : (
          /* Official Mode Indicators */
          <>
            {isWinner && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}