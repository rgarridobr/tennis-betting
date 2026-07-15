'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import { getFlagUrl } from '@/lib/countries';
import { saveFullBracketAction } from '@/lib/actions/predictions';
import { Check, Trophy, X, Pencil, AlertCircle, Layout, User as UserIcon, ArrowRight, Clock, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import { AdminMatchActions } from '@/components/admin/admin-match-actions';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  qualifierPlayerId?: number;
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
  qualifierPlayerId,
}: TournamentBracketProps) {
  const tButtons = useTranslations('buttons');
  const tTennis = useTranslations('tennis');
  const tBracket = useTranslations('bracket');
  const tFeedback = useTranslations('feedback');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [localPredictions, setLocalPredictions] =
    useState<Record<number, { winnerId: number; score?: string }>>(predictions);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Track if user has unsaved changes
  const hasUnsavedChanges = canMakePredictions && JSON.stringify(localPredictions) !== JSON.stringify(predictions);

  // Warn user before leaving the page with unsaved predictions
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = tBracket('unsavedWarning');
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, tBracket]);

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
  const [viewMode, setViewMode] = useState<'official' | 'predictions'>(
    isViewingOthers ? 'predictions' : (hasStarted || !isEnrolled ? 'official' : 'predictions')
  );
  const router = useRouter();

  const isRealPlayerId = (playerId: number | null | undefined) => !!playerId && playerId !== qualifierPlayerId;
  const isAutomaticByePick = (match: BracketMatch, winnerId: number) => {
    const player1IsBye = match.player1_type === 'BYE';
    const player2IsBye = match.player2_type === 'BYE';
    return (
      (player1IsBye && match.player2_id === winnerId && isRealPlayerId(match.player2_id)) ||
      (player2IsBye && match.player1_id === winnerId && isRealPlayerId(match.player1_id))
    );
  };
  const getBracketValidationError = () => {
    if (rounds.length === 0 || maxRound === 0) return tFeedback('bracketUnavailable');

    const resolvedWinners = new Map<number, number>();

    for (const round of rounds) {
      const roundMatches = [...(matchesByRound[round] || [])].sort((a, b) => a.position - b.position);

      for (const match of roundMatches) {
        const prediction = localPredictions[match.id];
        if (!prediction?.winnerId) return tFeedback('fillAllMatches');

        let validWinnerIds: number[] = [];

        if (match.round === 1) {
          if (isRealPlayerId(match.player1_id)) validWinnerIds.push(match.player1_id!);
          if (isRealPlayerId(match.player2_id)) validWinnerIds.push(match.player2_id!);

          if (
            validWinnerIds.length === 1 &&
            !isAutomaticByePick(match, validWinnerIds[0]) &&
            (match.player1_type === 'QUALIFIER' || match.player2_type === 'QUALIFIER')
          ) {
            return tFeedback('waitPlayersDefined');
          }
        } else {
          const previousRound = match.round - 1;
          const previousMatch1 = matchesMap[`${previousRound}-${match.position * 2 - 1}`];
          const previousMatch2 = matchesMap[`${previousRound}-${match.position * 2}`];
          const winner1 = previousMatch1 ? resolvedWinners.get(previousMatch1.id) : undefined;
          const winner2 = previousMatch2 ? resolvedWinners.get(previousMatch2.id) : undefined;

          if (winner1) validWinnerIds.push(winner1);
          if (winner2) validWinnerIds.push(winner2);
        }

        validWinnerIds = Array.from(new Set(validWinnerIds));

        if (!validWinnerIds.includes(prediction.winnerId)) {
          return tFeedback('invalidPredictionChain');
        }

        resolvedWinners.set(match.id, prediction.winnerId);
      }
    }

    return null;
  };
  const bracketValidationError = getBracketValidationError();
  const canFinalizeBracket = !bracketValidationError;

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

  const handleRoundSelect = (round: number) => {
    // Determine scroll direction for CSS animation
    const currentIndex = rounds.indexOf(selectedRound);
    const newIndex = rounds.indexOf(round);

    if (newIndex > currentIndex) {
      setDirection('right');
    } else if (newIndex < currentIndex) {
      setDirection('left');
    }

    setSelectedRound(round);

    // Reset scroll to left instantly so the CSS animation starts cleanly from the edge
    // and remove native horizontal scrolling completely
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        left: 0,
        behavior: 'instant',
      });
    }
  };

  const handleFinalize = async () => {
    if (isFinalizing) return;
    if (bracketValidationError) {
      toast.error(bracketValidationError);
      return;
    }

    setIsFinalizing(true);
    try {
      const predictionArray = Object.entries(localPredictions).map(([matchId, data]) => ({
        matchId: parseInt(matchId),
        winnerId: data.winnerId,
        score: data.score,
      }));

      await saveFullBracketAction(userId, tournamentId, predictionArray);
      toast.success(tFeedback('predictionSaved'));
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || tFeedback('predictionSaveErrorDetail'));
      setIsFinalizing(false);
    }
  };

  const resolveRoundLabel = (code?: string, roundNum?: number) => {
    if (code === 'F') return tTennis('final');
    if (code === 'SF') return tTennis('semifinals');
    if (code === 'QF') return tTennis('quarterfinals');
    if (code === 'R16' || code === 'OITAVAS') return tTennis('roundOf16');
    if (code === 'R32') return tTennis('roundOf32');
    if (code === 'R64') return tTennis('roundOf64');
    if (code) return code;
    return `${tTennis('round')} ${roundNum ?? ''}`.trim();
  };

  // Map of player ID to player details for display in predicted rounds
  const playersById: Record<
    number,
    { name: string; display_name: string | null; seed: number | null; type: string; country: string | null }
  > = {};

  // Initialize with players from the players prop
  if (players && players.length > 0) {
    for (const p of players) {
      playersById[p.id] = {
        name: p.name,
        display_name: p.display_name,
        seed: p.seed,
        type: 'PLAYER',
        country: p.country,
      };
    }
  }

  // Add the generic qualifier if provided
  if (qualifierPlayerId && !playersById[qualifierPlayerId]) {
    playersById[qualifierPlayerId] = {
      name: tTennis('qualifier'),
      display_name: tTennis('qualifier'),
      seed: null,
      type: 'QUALIFIER',
      country: null,
    };
  }

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

  /**
   * Recursively resolve a qualifier prediction back through the bracket to find the real player.
   * Traces the prediction chain from the given match back to round 1 where the qualifier slot
   * has the actual player defined.
   */
  function resolveQualifierFromBracket(
    match: BracketMatch | undefined,
    preds: Record<number, { winnerId: number; score?: string }>,
    mMap: Record<string, BracketMatch>,
    qPlayerId: number,
    pById: Record<number, { name: string; display_name: string | null; seed: number | null; type: string; country: string | null }>,
  ): { realId: number | null; displayName: string | null } {
    if (!match) return { realId: null, displayName: null };

    // For round 1 matches, check the official match data directly
    if (match.round === 1) {
      const qSlotIsP1 = match.player1_type === 'QUALIFIER' || match.player1_type === 'LUCKY_LOSER';
      const qSlotIsP2 = match.player2_type === 'QUALIFIER' || match.player2_type === 'LUCKY_LOSER';

      // Check if the prediction used a slot marker
      const slotMarker = preds[match.id]?.score;

      if (slotMarker === '__SLOT_1__') {
        // User picked slot 1
        if (match.player1_id && match.player1_id !== qPlayerId) {
          return { realId: match.player1_id, displayName: null };
        }
        return { realId: null, displayName: tTennis('qualifier1') };
      } else if (slotMarker === '__SLOT_2__') {
        // User picked slot 2
        if (match.player2_id && match.player2_id !== qPlayerId) {
          return { realId: match.player2_id, displayName: null };
        }
        return { realId: null, displayName: tTennis('qualifier2') };
      }

      // No slot marker - try to resolve from match types
      if (qSlotIsP1 && match.player1_id && match.player1_id !== qPlayerId) {
        return { realId: match.player1_id, displayName: null };
      }
      if (qSlotIsP2 && match.player2_id && match.player2_id !== qPlayerId) {
        return { realId: match.player2_id, displayName: null };
      }

      return { realId: null, displayName: null };
    }

    // For rounds > 1, trace back: find which previous match fed the qualifier into this one
    const prevRound = match.round - 1;
    const prevM1 = mMap[`${prevRound}-${match.position * 2 - 1}`];
    const prevM2 = mMap[`${prevRound}-${match.position * 2}`];

    // Check which previous match had the qualifier prediction
    const pred1 = preds[prevM1?.id]?.winnerId;
    const pred2 = preds[prevM2?.id]?.winnerId;

    // If a previous match prediction is qualifierPlayerId, recurse to resolve it
    if (pred1 === qPlayerId && prevM1) {
      return resolveQualifierFromBracket(prevM1, preds, mMap, qPlayerId, pById);
    }
    if (pred2 === qPlayerId && prevM2) {
      return resolveQualifierFromBracket(prevM2, preds, mMap, qPlayerId, pById);
    }

    // If the prediction in the previous round used a real player ID that is a qualifier,
    // return that real ID directly (the qualifier was already resolved at prediction time).
    // Check both playersById type and the match's player types for robustness.
    if (pred1 && pred1 !== qPlayerId && prevM1) {
      const isQualifier = pById[pred1]?.type === 'QUALIFIER' ||
        (prevM1.player1_id === pred1 && prevM1.player1_type === 'QUALIFIER') ||
        (prevM1.player2_id === pred1 && prevM1.player2_type === 'QUALIFIER');
      if (isQualifier) return { realId: pred1, displayName: null };
    }
    if (pred2 && pred2 !== qPlayerId && prevM2) {
      const isQualifier = pById[pred2]?.type === 'QUALIFIER' ||
        (prevM2.player1_id === pred2 && prevM2.player1_type === 'QUALIFIER') ||
        (prevM2.player2_id === pred2 && prevM2.player2_type === 'QUALIFIER');
      if (isQualifier) return { realId: pred2, displayName: null };
    }

    return { realId: null, displayName: null };
  }

  const CARD_HEIGHT = 110;
  const BASE_GAP = 24;



  return (
    <div className="flex flex-col gap-6">
      {/* Sticky Header with Toggles and Filters */}
      <div className="sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md py-1 rounded-[2rem] border border-slate-200/50 shadow-sm px-6 flex flex-col md:flex-row items-center justify-between md:gap-4 gap-2 mb-8">
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
              <span className="whitespace-nowrap">{tButtons('official')}</span>
            </button>
            <button
              onClick={() => setViewMode('predictions')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                viewMode === 'predictions' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50',
              )}
            >
              <UserIcon className="w-3 h-3" />
              <span className="whitespace-nowrap">
                {isViewingOthers ? tButtons('viewPrediction') : tButtons('myPrediction')}
              </span>
            </button>
          </div>
        )}

        {/* Round Filter */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide max-w-full md:py-5 md:px-5 py-1 z-50">
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
        {viewMode === 'predictions' && !hasStarted && canMakePredictions && hasUnsavedChanges && (
          <div className="flex items-center gap-3">
            {bracketValidationError && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 animate-pulse">
                {bracketValidationError}
              </span>
            )}
            <button
              onClick={handleFinalize}
              disabled={isFinalizing || !canFinalizeBracket}
              className={cn(
                'flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all animate-in fade-in slide-in-from-right-4',
                !canFinalizeBracket
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-slate-100'
                  : isFinalizing
                    ? 'bg-emerald-600 text-white opacity-80 cursor-not-allowed shadow-emerald-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 shadow-emerald-200',
              )}
            >
              {isFinalizing ? (
                <>
                  <span className="whitespace-nowrap">{tButtons('saving')}</span>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  <span className="whitespace-nowrap">{tButtons('finalize')}</span>
                  <LogOut className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
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
          className="overflow-x-hidden overflow-y-auto relative custom-scrollbar max-h-[80vh] scroll-smooth"

        >
          <div
            key={selectedRound}
            className={cn(
              'flex gap-12 md:gap-24 relative pb-20 min-w-max md:min-w-max animate-in fade-in duration-500 p-2 px-4 md:p-12 pt-0',
              direction === 'right'
                ? 'slide-in-from-right-48'
                : direction === 'left'
                  ? 'slide-in-from-left-48'
                  : 'slide-in-from-bottom-4',
            )}
          >
            {rounds
              .filter((r, idx) => {
                const selectedIdx = rounds.indexOf(selectedRound);
                return idx >= selectedIdx;
              })
              .map((round) => {
                const roundIdx = rounds.indexOf(round);
                const isFinalRound = roundIdx === rounds.length - 1;
                
                // The selected round is the root, ensuring compact vertical spacing
                const selectedIdx = rounds.indexOf(selectedRound);
                const relativeIdx = roundIdx - selectedIdx;

                const multiplier = Math.pow(2, relativeIdx);
                const verticalGap = multiplier === 1 ? BASE_GAP : multiplier * (CARD_HEIGHT + BASE_GAP) - CARD_HEIGHT;
                const paddingTop = multiplier === 1 ? 0 : ((multiplier - 1) * (CARD_HEIGHT + BASE_GAP)) / 2;

                return (
                  <div
                    key={`round-${round}`}
                    data-round={round}
                    className={cn(
                      'flex flex-col w-[300px] md:w-[300px] relative z-10 shrink-0 snap-center transition-all duration-500 ease-in-out'
                    )}
                  >
                    <div className="sticky top-0 md:pt-3 pt-10 z-30 flex flex-col items-center gap-2 m-auto">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 inline-block px-6 py-2 rounded-full border border-emerald-100 shadow-sm whitespace-nowrap">
                        {resolveRoundLabel(roundNames[round], round)}
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
                                  {tBracket('missingMatch')}
                                </p>
                                <p className="text-[8px] font-bold text-center opacity-70">{tBracket('bracketError')}</p>
                              </div>
                            </div>
                          );
                        }

                        let p1 = null;
                        let p2 = null;

                        if (viewMode === 'predictions' || match.round === 1 || isAdmin) {
                          if (isAdmin) {
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
                          } else if (match.round === 1) {
                            // Round 1 in predictions mode: show official players
                            // BUT if the user predicted a player that was replaced (e.g. by LL),
                            // show the predicted player instead so the user sees their original pick marked as incorrect
                            const userPred = viewMode === 'predictions' ? localPredictions[match.id]?.winnerId : undefined;
                            const predIsForReplacedPlayer = userPred && 
                              userPred !== match.player1_id && 
                              userPred !== match.player2_id &&
                              userPred !== qualifierPlayerId;

                            if (userPred === qualifierPlayerId) {
                              // User predicted the generic Qualifier - show official players normally
                              // The highlight will resolve to the real player in the qualifier slot
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
                            } else if (predIsForReplacedPlayer && playersById[userPred]) {
                              // The user predicted a player that was replaced (LL scenario)
                              // Show the predicted player in the slot of the player that replaced them
                              const replacedSlot1 = match.player1_type === 'LUCKY_LOSER' || match.player1_type === 'WILDCARD';
                              const replacedSlot2 = match.player2_type === 'LUCKY_LOSER' || match.player2_type === 'WILDCARD';

                              if (replacedSlot1) {
                                // Player 1 is the LL replacement - show predicted player there
                                p1 = { id: userPred, ...playersById[userPred] };
                                p2 = {
                                  id: match.player2_id,
                                  name: match.player2_name,
                                  display_name: match.player2_display_name,
                                  seed: match.player2_seed,
                                  type: match.player2_type,
                                  country: match.player2_country,
                                };
                              } else if (replacedSlot2) {
                                // Player 2 is the LL replacement - show predicted player there
                                p1 = {
                                  id: match.player1_id,
                                  name: match.player1_name,
                                  display_name: match.player1_display_name,
                                  seed: match.player1_seed,
                                  type: match.player1_type,
                                  country: match.player1_country,
                                };
                                p2 = { id: userPred, ...playersById[userPred] };
                              } else {
                                // Can't determine which slot was replaced, show official
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
                              }
                            } else {
                              // Normal case: user predicted one of the current players, or hasn't predicted
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
                            }
                          } else {
                            const prevRound = match.round - 1;
                            const m1 = matchesMap[`${prevRound}-${match.position * 2 - 1}`];
                            const m2 = matchesMap[`${prevRound}-${match.position * 2}`];

                            let pred1 = localPredictions[m1?.id]?.winnerId;
                            let pred2 = localPredictions[m2?.id]?.winnerId;
                            let pred1DisplayName: string | null = null;
                            let pred2DisplayName: string | null = null;

                            // Resolve qualifier predictions recursively:
                            // If the user predicted "Qualifier" (generic ID), trace back through the bracket
                            // to find the original qualifier slot and resolve to the real player if defined.
                            if (pred1 && pred1 === qualifierPlayerId) {
                              const resolved = resolveQualifierFromBracket(m1, localPredictions, matchesMap, qualifierPlayerId, playersById);
                              if (resolved.realId) {
                                pred1 = resolved.realId;
                              } else {
                                pred1DisplayName = resolved.displayName || tTennis('qualifier');
                              }
                            }
                            if (pred2 && pred2 === qualifierPlayerId) {
                              const resolved = resolveQualifierFromBracket(m2, localPredictions, matchesMap, qualifierPlayerId, playersById);
                              if (resolved.realId) {
                                pred2 = resolved.realId;
                              } else {
                                pred2DisplayName = resolved.displayName || tTennis('qualifier');
                              }
                            }

                            // In predictions mode, prioritize the user's prediction from previous round
                            // But fallback to official player if user hasn't predicted yet (e.g. BYE or partial bracket)
                            if (pred1) {
                              p1 = { id: pred1, ...playersById[pred1], ...(pred1DisplayName ? { display_name: pred1DisplayName } : {}) };
                            } else if (match.player1_id) {
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
                              p2 = { id: pred2, ...playersById[pred2], ...(pred2DisplayName ? { display_name: pred2DisplayName } : {}) };
                            } else if (match.player2_id) {
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
                             {/* Incoming bracket connection perfectly aligned to the left edge of the screen */}
                             {round === selectedRound && roundIdx > 0 && (
                               <div className="absolute right-full top-1/2 -translate-y-1/2 w-8 md:w-12 h-[64px] pointer-events-none">
                                 {/* Vertical line near the edge of the screen */}
                                 <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-slate-200" />
                                 {/* Top left branch touching the edge of the screen */}
                                 <div className="absolute left-0 top-0 w-2 h-[2px] bg-slate-200" />
                                 {/* Bottom left branch touching the edge of the screen */}
                                 <div className="absolute left-0 bottom-0 w-2 h-[2px] bg-slate-200" />
                                 {/* Middle horizontal line connecting the fork to the card */}
                                 <div className="absolute left-2 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200" />
                               </div>
                             )}
                            <BracketMatchCard
                              match={match}
                              p1={p1}
                              p2={p2}
                              userId={userId}
                              tournamentId={tournamentId}
                              currentPrediction={localPredictions[match.id]}
                              actualPrediction={predictions[match.id]}
                              canMakePredictions={canMakePredictions && viewMode === 'predictions'}
                              qualifierPlayerId={qualifierPlayerId}
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

                            {!isFinalRound && (
                              <div
                                className="absolute -right-12 md:-right-24 top-1/2 w-12 md:w-24 pointer-events-none block"
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
  playerEliminatedInRound,
  allOfficialPlayerIds,
  qualifierPlayerId,
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
  qualifierPlayerId?: number;
}) {
  const tBracket = useTranslations('bracket');
  const tTennis = useTranslations('tennis');

  const isCompleted = match.status === 'completed';
  const isFinishedTournament =
    tournamentStatus === 'FINISHED' || tournamentStatus === 'finished' || tournamentStatus === 'completed';
  const canPredict = canMakePredictions && !isCompleted;

  const selectedWinnerId = currentPrediction?.winnerId;

  // If the prediction points to the generic Qualifier but the real player has been defined,
  // resolve to the real player ID for correct highlighting
  const resolvedSelectedWinnerId = (() => {
    if (selectedWinnerId !== qualifierPlayerId || !qualifierPlayerId) return selectedWinnerId;
    // The user predicted "Qualifier" - find which real player is in the qualifier slot
    // First try using the official match types (works for round 1)
    const isP1QualifierSlot = match.player1_type === 'QUALIFIER' || match.player1_type === 'LUCKY_LOSER';
    const isP2QualifierSlot = match.player2_type === 'QUALIFIER' || match.player2_type === 'LUCKY_LOSER';
    if (isP1QualifierSlot && p1?.id && p1.id !== qualifierPlayerId) return p1.id;
    if (isP2QualifierSlot && p2?.id && p2.id !== qualifierPlayerId) return p2.id;
    // For rounds > 1, the p1/p2 come from resolved predictions and carry their original type.
    // Check if either p1 or p2 was originally a qualifier player
    if (p1?.id && p1.id !== qualifierPlayerId && p1?.type === 'QUALIFIER') return p1.id;
    if (p2?.id && p2.id !== qualifierPlayerId && p2?.type === 'QUALIFIER') return p2.id;
    // Last resort: if only one of p1/p2 has qualifierPlayerId as id, the prediction must be for that one
    if (p1?.id === qualifierPlayerId && p2?.id && p2.id !== qualifierPlayerId) return qualifierPlayerId;
    if (p2?.id === qualifierPlayerId && p1?.id && p1.id !== qualifierPlayerId) return qualifierPlayerId;
    return selectedWinnerId;
  })();

  // Logic to determine if a player in the user's bracket is "incorrect" based on official results
  const isP1Incorrect =
    viewMode === 'predictions' &&
    p1?.id &&
    ((match.player1_id && match.player1_id !== p1.id) ||
      (match.winner_id && match.winner_id !== p1.id && isCompleted) ||
      (playerEliminatedInRound.has(p1.id) && playerEliminatedInRound.get(p1.id)! <= match.round) ||
      (!allOfficialPlayerIds.has(p1.id) && p1.type !== 'BYE' && p1.type !== 'QUALIFIER' && p1.id !== qualifierPlayerId));

  const isP2Incorrect =
    viewMode === 'predictions' &&
    p2?.id &&
    ((match.player2_id && match.player2_id !== p2.id) ||
      (match.winner_id && match.winner_id !== p2.id && isCompleted) ||
      (playerEliminatedInRound.has(p2.id) && playerEliminatedInRound.get(p2.id)! <= match.round) ||
      (!allOfficialPlayerIds.has(p2.id) && p2.type !== 'BYE' && p2.type !== 'QUALIFIER' && p2.id !== qualifierPlayerId));

  // LL rule: points are only cancelled if the Lucky Loser player WON the match.
  // If the match has no result yet or the LL lost, don't show as cancelled.
  const hasLLPlayer = match.player1_type === 'LUCKY_LOSER' || match.player2_type === 'LUCKY_LOSER';
  const winnerIsLL = isCompleted && match.winner_id && (
    (match.winner_id === match.player1_id && match.player1_type === 'LUCKY_LOSER') ||
    (match.winner_id === match.player2_id && match.player2_type === 'LUCKY_LOSER')
  );
  // Show cancelled only if: LL won, or walkover, or manually cancelled (non-LL reason)
  const effectivePointsCancelled = !!(match.points_cancelled && (!hasLLPlayer || winnerIsLL));

  const cardContent = (
    <>
      {(() => {
        const bothAreGenericQualifiers = 
          (p1?.type === 'QUALIFIER' && (!p1?.id || p1?.id === qualifierPlayerId)) &&
          (p2?.type === 'QUALIFIER' && (!p2?.id || p2?.id === qualifierPlayerId));
        
        // When both are generic qualifiers, use the score marker to determine which slot was picked
        const predScore = currentPrediction?.score;
        const pickedSlot = predScore === '__SLOT_1__' ? 1 : predScore === '__SLOT_2__' ? 2 : null;
        // Fallback for legacy predictions without slot marker: show p1 as selected
        const hasLegacyQualifierPred = !pickedSlot && currentPrediction?.winnerId === qualifierPlayerId;

        const p1IsSelected = bothAreGenericQualifiers
          ? pickedSlot === 1 || hasLegacyQualifierPred
          : resolvedSelectedWinnerId === p1?.id || (p1?.type === 'QUALIFIER' && (!p1?.id || p1?.id === qualifierPlayerId) && resolvedSelectedWinnerId === qualifierPlayerId);
        
        const p2IsSelected = bothAreGenericQualifiers
          ? pickedSlot === 2
          : resolvedSelectedWinnerId === p2?.id || (p2?.type === 'QUALIFIER' && (!p2?.id || p2?.id === qualifierPlayerId) && resolvedSelectedWinnerId === qualifierPlayerId);

        const p1IsPlaceholder =
          ((!p1?.id || p1?.id === qualifierPlayerId) && p1?.type !== 'BYE' && p1?.type !== 'PLAYER') ||
          p1?.isAwaiting ||
          p1?.isNotPredicted;
        const p2IsPlaceholder =
          ((!p2?.id || p2?.id === qualifierPlayerId) && p2?.type !== 'BYE' && p2?.type !== 'PLAYER') ||
          p2?.isAwaiting ||
          p2?.isNotPredicted;
        const p1CanPredict = !!canPredict && !p1IsPlaceholder && !!p1?.id;
        const p2CanPredict = !!canPredict && !p2IsPlaceholder && !!p2?.id;

        return (
          <>
            <PlayerRow
              name={p1?.name || null}
              display_name={bothAreGenericQualifiers ? tTennis('qualifier1') : (p1?.display_name || null)}
              seed={p1?.seed || null}
              type={p1?.type}
              country={p1?.country}
              isWinner={match.winner_id === p1?.id && isCompleted}
              isSelected={p1IsSelected}
              isPredicted={p1IsSelected}
              isCompleted={isCompleted}
              onSelect={() => {
                if (p1?.id && p1?.id !== qualifierPlayerId) {
                  onPredict(p1.id);
                } else if (p1?.type === 'QUALIFIER' && qualifierPlayerId) {
                  onPredict(qualifierPlayerId, bothAreGenericQualifiers ? '__SLOT_1__' : undefined);
                } else if (p1?.type === 'QUALIFIER') {
                  toast.info(tBracket('awaitingQualifier'));
                }
              }}
              canPredict={p1CanPredict}
              score={match.score}
              isP1={true}
              isPlaceholder={p1IsPlaceholder}
              pointsCancelled={effectivePointsCancelled}
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
              display_name={bothAreGenericQualifiers ? tTennis('qualifier2') : (p2?.display_name || null)}
              seed={p2?.seed || null}
              type={p2?.type}
              country={p2?.country}
              isWinner={match.winner_id === p2?.id && isCompleted}
              isSelected={p2IsSelected}
              isPredicted={p2IsSelected}
              isCompleted={isCompleted}
              onSelect={() => {
                if (p2?.id && p2?.id !== qualifierPlayerId) {
                  onPredict(p2.id);
                } else if (p2?.type === 'QUALIFIER' && qualifierPlayerId) {
                  onPredict(qualifierPlayerId, bothAreGenericQualifiers ? '__SLOT_2__' : undefined);
                } else if (p2?.type === 'QUALIFIER') {
                  toast.info(tBracket('awaitingQualifier'));
                }
              }}
              canPredict={p2CanPredict}
              score={match.score}
              isP1={false}
              isPlaceholder={p2IsPlaceholder}
              pointsCancelled={effectivePointsCancelled}
              isAwaiting={p2?.isAwaiting}
              viewMode={viewMode}
              isForceIncorrect={isP2Incorrect}
              isNotPredicted={p2?.isNotPredicted}
              isAdmin={isAdmin}
              isFinishedTournament={isFinishedTournament}
            />
          </>
        );
      })()}
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
  const tBracket = useTranslations('bracket');
  const tTennis = useTranslations('tennis');

  const displayName = isAwaiting
    ? tBracket('awaitingResults')
    : isNotPredicted
      ? tBracket('notPredicted')
      : name ||
      (type === 'QUALIFIER'
        ? tTennis('qualifier')
        : type === 'WILDCARD'
          ? tTennis('wildcard')
          : type === 'LUCKY_LOSER'
            ? tTennis('luckyLoser')
          : type === 'NEXT_GEN'
            ? tTennis('nextGen')
            : type === 'ALT'
              ? tTennis('alternate')
            : type === 'BYE'
              ? tTennis('bye')
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
          {viewMode === 'predictions' ? tBracket('notPredicted') : tBracket('toBeDefined')}
        </span>
      </div>
    );
  }

  const showPredictionResult = (isCompleted && isPredicted) || (isPredicted && isForceIncorrect);

  // Handle W/O with optional score (e.g., "W/O 6-4")
  let displaySets: string[] = [];
  let isWalkover = false;
  
  if (score) {
    const scoreUpper = score.toUpperCase();
    if (scoreUpper === 'W/O' || scoreUpper === 'WALKOVER') {
      isWalkover = true;
      displaySets = [];
    } else if (scoreUpper.startsWith('W/O') || scoreUpper.startsWith('WALKOVER')) {
      isWalkover = true;
      // Extract score part after W/O or WALKOVER
      const scorePart = score
        .replace(/^W\/O\s*/i, '')
        .replace(/^WALKOVER\s*/i, '')
        .trim();
      if (scorePart) {
        displaySets = scorePart.split(/\s+/);
      }
    } else {
      // Regular score
      displaySets = score.includes('-') && !score.includes(' ') ? [score] : score.split(/\s+/);
    }
  }
  
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
        {isWalkover && displaySets.length > 0 && !isWinner && (
          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-black whitespace-nowrap">
            {tTennis('retired')}
          </span>
        )}
        {showPredictionResult && pointsCancelled && viewMode === 'predictions' && (
          <div className="ml-2 bg-red-500 text-white text-[8px] font-black h-4 px-1 flex items-center rounded-sm whitespace-nowrap">
            {tTennis('pointsCancelled')}
          </div>
        )}
      </div>

      {displaySets.length > 0 && (
        <div className="flex items-center gap-0.1 ml-3">
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
                      isSetWinner ? 'text-slate-500' : 'text-slate-400',
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

      {isWalkover && displaySets.length === 0 && !isWinner && (
        <div className="flex items-center gap-1.5 ml-3">
          <div className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black whitespace-nowrap">
            W/O
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 ml-1 shrink-0 min-w-[24px]">
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