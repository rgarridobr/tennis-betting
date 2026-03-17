'use client';

import React, { useRef, useState, useTransition } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import { getFlagUrl } from '@/lib/countries';
import { makePredictionAction } from '@/lib/actions/predictions';
import { Check, Trophy, X, Pencil, AlertCircle, Layout, User as UserIcon, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const CARD_HEIGHT = 110;
  const BASE_GAP = 24;

  return (
    <div className="flex flex-col gap-6">
      {viewMode === 'predictions' && canMakePredictions && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm">
          {/* Lado esquerdo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div>
              <p className="font-black text-emerald-900 leading-tight text-sm sm:text-base">Modo de Palpite Ativo</p>
              <p className="text-[11px] sm:text-xs font-bold text-emerald-700">
                Preencha todo o chaveamento e clique em concluir.
              </p>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={handleFinish}
            disabled={!isBracketComplete() || isSaving}
            className={cn(
              'w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg',
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
      <div className="sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md py-1 rounded-[2rem] border border-slate-200/50 shadow-sm px-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
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
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200',
              )}
            >
              {roundNames[round] || `R${round}`}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-300 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto relative scrollbar-hide max-h-[70vh] md:max-h-[75vh]"
        >
          <div
            key={selectedRound}
            className={cn(
              'flex gap-24 relative pb-20 min-w-max justify-center animate-in fade-in duration-500 p-8 md:p-12 pt-0',
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
                    <div className="sticky top-0 md:pt-3 pt-25 z-30 flex flex-col items-center gap-2 m-auto">
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
                            } else if (match.player1_id) {
                              p1 = {
                                id: match.player1_id,
                                name: match.player1_name,
                                seed: match.player1_seed,
                                type: match.player1_type,
                                country: match.player1_country,
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
                                country: match.player2_country,
                              };
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
  const canPredict = canMakePredictions && !isCompleted && p1?.id && p2?.id;

  const selectedWinnerId = currentPrediction?.winnerId;

  // Logic to determine if a player in the user's bracket is "incorrect" based on official results
  const isP1Incorrect =
    viewMode === 'predictions' &&
    ((match.player1_id && p1?.id && match.player1_id !== p1.id) ||
      (match.winner_id && p1?.id && match.winner_id !== p1.id && isCompleted));
  const isP2Incorrect =
    viewMode === 'predictions' &&
    ((match.player2_id && p2?.id && match.player2_id !== p2.id) ||
      (match.winner_id && p2?.id && match.winner_id !== p2.id && isCompleted));

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
        isPlaceholder={(!p1?.id && p1?.type !== 'BYE' && p1?.type !== 'PLAYER') || p1?.isAwaiting}
        pointsCancelled={match.points_cancelled}
        isAwaiting={p1?.isAwaiting}
        viewMode={viewMode}
        isForceIncorrect={isP1Incorrect}
        isAdmin={isAdmin}
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
        isPlaceholder={(!p2?.id && p2?.type !== 'BYE' && p2?.type !== 'PLAYER') || p2?.isAwaiting}
        pointsCancelled={match.points_cancelled}
        isAwaiting={p2?.isAwaiting}
        viewMode={viewMode}
        isForceIncorrect={isP2Incorrect}
        isAdmin={isAdmin}
      />

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
    </>
  );

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full transition-all hover:shadow-md hover:-translate-y-0.5 group relative',
        (isAdmin || canPredict) && 'cursor-pointer',
        isAdmin && !isCompleted && 'hover:border-emerald-200 hover:ring-2 hover:ring-emerald-50',
      )}
    >
      {isAdmin && !isCompleted ? (
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
  const flagUrl = getFlagUrl(country);

  return (
    <div
      onClick={canPredict ? onSelect : undefined}
      className={cn(
        'flex items-center px-4 py-3 transition-all relative min-h-[48px]',
        canPredict || (isAdmin && !isCompleted) ? 'cursor-pointer' : 'cursor-default',
        canPredict && 'hover:bg-emerald-50/40',
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
                </React.Fragment>
              )
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 ml-2 shrink-0 min-w-[24px]">
        {viewMode === 'predictions' ? (
          isSelected && !isCompleted ? (
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
