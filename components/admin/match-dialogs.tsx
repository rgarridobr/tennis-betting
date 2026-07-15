'use client';

import React, { useEffect, useState, useTransition } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import {
  setMatchPlayersAction,
  setMatchResultAction,
  updatePlaceholderPlayerAction,
  clearMatchResultAction,
  cancelMatchPointsAction,
} from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Pencil, Trophy, CheckCircle2, AlertCircle, X, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// ==================== HELPER FUNCTIONS ====================

type MatchResultMode = 'regular' | 'walkover' | 'retired';

function getMatchResultMode(score?: string | null): { mode: MatchResultMode; partialScore: string } {
  const scoreUpper = score?.toUpperCase() || '';
  const isWalkoverScore = scoreUpper.startsWith('W/O') || scoreUpper.startsWith('WALKOVER');
  const partialScore = isWalkoverScore
    ? score?.replace(/^W\/O\s*/i, '').replace(/^WALKOVER\s*/i, '').trim() || ''
    : '';

  return {
    mode: isWalkoverScore ? (partialScore ? 'retired' : 'walkover') : 'regular',
    partialScore,
  };
}

function formatPlayerName(
  name: string | null,
  seed: number | null,
  type: string | undefined,
  toBeDefined: string,
) {
  if (!name) {
    if (type === 'QUALIFIER') return 'Qualifier';
    if (type === 'WILDCARD') return 'Wild Card';
    if (type === 'LUCKY_LOSER') return 'Lucky Loser';
    if (type === 'NEXT_GEN') return 'Next Gen';
    if (type === 'BYE') return 'BYE';
    if (type === 'ALT') return 'Alternate';
    return toBeDefined;
  }

  if (type === 'SEED' && seed) return `${name} (${seed})`;
  if (type === 'QUALIFIER') return `${name} (Q)`;
  if (type === 'WILDCARD') return `${name} (WC)`;
  if (type === 'LUCKY_LOSER') return `${name} (LL)`;
  if (type === 'NEXT_GEN') return `${name} (NG)`;
  if (type === 'ALT') return `${name} (ALT)`;
  return name;
}

// ==================== HELPER COMPONENTS ====================

function SlotConfig({
  label,
  type,
  setType,
  playerId,
  setPlayerId,
  seed,
  setSeed,
  players,
  assignedPlayerIds = [],
}: {
  label: string;
  type: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN';
  setType: (value: 'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN') => void;
  playerId: string;
  setPlayerId: (value: string) => void;
  seed: string;
  setSeed: (value: string) => void;
  players: Player[];
  assignedPlayerIds?: number[];
}) {
  const t = useTranslations('admin');
  const filteredPlayers = players
    .filter((p) => !assignedPlayerIds.includes(p.id) || p.id.toString() === playerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const options = filteredPlayers.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }));

  return (
    <div className="space-y-4 bg-slate-50 rounded-2xl border border-slate-100">
      {' '}
      {(type === 'PLAYER' ||
        type === 'SEED' ||
        type === 'QUALIFIER' ||
        type === 'WILDCARD' ||
        type === 'LUCKY_LOSER' ||
        type === 'NEXT_GEN') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold">
              {type === 'QUALIFIER' || type === 'WILDCARD'
                ? t('match.playerOptional')
                : t('match.selectPlayer')}
            </Label>
            {playerId && (
              <button
                type="button"
                onClick={() => setPlayerId('')}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5 transition-colors"
              >
                <X className="w-3 h-3" /> {t('match.remove')}
              </button>
            )}
          </div>
          <Combobox
            options={options}
            value={playerId}
            onValueChange={setPlayerId}
            placeholder={t('match.selectPlayerPlaceholder')}
          />
        </div>
      )}{' '}
      {type === 'SEED' && (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold">{t('match.seedNumber')}</Label>
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder=""
            className="rounded-xl border-2 font-bold"
          />
        </div>
      )}
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="font-bold rounded-xl border-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="PLAYER" className="font-bold">
            {t('match.typePlayer')}
          </SelectItem>
          <SelectItem value="SEED" className="font-bold">
            {t('match.typeSeed')}
          </SelectItem>
          <SelectItem value="QUALIFIER" className="font-bold">
            {t('match.typeQualifier')}
          </SelectItem>
          <SelectItem value="WILDCARD" className="font-bold">
            {t('match.typeWildcard')}
          </SelectItem>
          <SelectItem value="LUCKY_LOSER" className="font-bold">
            {t('match.typeLuckyLoser')}
          </SelectItem>
          <SelectItem value="NEXT_GEN" className="font-bold">
            {t('match.typeNextGen')}
          </SelectItem>
          <SelectItem value="ALT" className="font-bold">
            {t('match.typeAlternate')}
          </SelectItem>
          <SelectItem value="BYE" className="font-bold">
            {t('match.typeBye')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ==================== EXPORTED DIALOGS ====================

export function SetPlayersDialog({
  match,
  players,
  tournamentId,
  trigger,
  assignedPlayerIds,
  onSuccess,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  trigger?: React.ReactNode;
  assignedPlayerIds?: number[];
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [p1Type, setP1Type] = useState<
    'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN'
  >((match.player1_type as any) || 'PLAYER');
  const [p1Id, setP1Id] = useState(match.player1_id?.toString() || '');
  const [p1Seed, setP1Seed] = useState(match.player1_seed?.toString() || '');

  const [p2Type, setP2Type] = useState<
    'PLAYER' | 'SEED' | 'QUALIFIER' | 'WILDCARD' | 'BYE' | 'LUCKY_LOSER' | 'NEXT_GEN'
  >((match.player2_type as any) || 'PLAYER');
  const [p2Id, setP2Id] = useState(match.player2_id?.toString() || '');
  const [p2Seed, setP2Seed] = useState(match.player2_seed?.toString() || '');

  useEffect(() => {
    if (open) {
      setP1Type((match.player1_type as any) || 'PLAYER');
      setP1Id(match.player1_id?.toString() || '');
      setP1Seed(match.player1_seed?.toString() || '');
      setP2Type((match.player2_type as any) || 'PLAYER');
      setP2Id(match.player2_id?.toString() || '');
      setP2Seed(match.player2_seed?.toString() || '');
      setError(null);
    }
  }, [open, match]);

  function handleSubmit() {
    setError(null);

    const parseSeed = (val: string) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const parseId = (val: string) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const p1 = {
      type: p1Type,
      id: parseId(p1Id),
      seed: p1Type === 'SEED' ? parseSeed(p1Seed) : null,
    };
    const p2 = {
      type: p2Type,
      id: parseId(p2Id),
      seed: p2Type === 'SEED' ? parseSeed(p2Seed) : null,
    };

    if (p1.type === 'SEED' && !p1.seed) return setError(t('match.errorSeedP1'));
    if (p2.type === 'SEED' && !p2.seed) return setError(t('match.errorSeedP2'));
    if (p1.type === 'BYE' && p2.type === 'BYE') return setError(t('match.errorByeVsBye'));

    startTransition(async () => {
      try {
        const result = await setMatchPlayersAction(match.id, p1 as any, p2 as any, tournamentId);
        if (result?.success) {
          setOpen(false);
          onSuccess?.();
        } else {
          setError(t('match.errorSaveMatchup'));
        }
      } catch {
        setError(t('match.errorUnexpected'));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider border-2"
          >
            <Pencil className="w-3 h-3 mr-1.5" /> {t('match.setMatchup')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {t('match.configureGame', { position: match.position })}
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border-2 border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 py-4 gap-4">
          <SlotConfig
            label={t('match.sideA')}
            type={p1Type}
            setType={setP1Type}
            playerId={p1Id}
            setPlayerId={setP1Id}
            seed={p1Seed}
            setSeed={setP1Seed}
            players={players}
            assignedPlayerIds={assignedPlayerIds}
          />
          <SlotConfig
            label={t('match.sideB')}
            type={p2Type}
            setType={setP2Type}
            playerId={p2Id}
            setPlayerId={setP2Id}
            seed={p2Seed}
            setSeed={setP2Seed}
            players={players}
            assignedPlayerIds={assignedPlayerIds}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-12 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
        >
          {isPending ? tButtons('saving') : t('match.confirmMatchup')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ReplaceMatchPlayerDialog({
  match,
  players,
  tournamentId,
  assignedPlayerIds,
  onSuccess,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  assignedPlayerIds?: number[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const tBracket = useTranslations('bracket');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [isLL, setIsLL] = useState(true);

  useEffect(() => {
    if (open) {
      setSelectedSlot(null);
      setPlayerId('');
      setIsLL(true);
    }
  }, [open]);

  useEffect(() => {
    if (selectedSlot) {
      const currentId = selectedSlot === 1 ? match.player1_id : match.player2_id;
      const type = selectedSlot === 1 ? match.player1_type : match.player2_type;
      setPlayerId(currentId?.toString() || '');
      // If it's a specific player already there, default to LL for replacement.
      // If it's an empty placeholder (like QUALIFIER), default to false (just filling the slot).
      setIsLL(type === 'LUCKY_LOSER' || (!!currentId && type === 'PLAYER'));
    }
  }, [selectedSlot, match]);

  const currentType = selectedSlot === 1 ? match.player1_type : match.player2_type;
  const currentId = selectedSlot === 1 ? match.player1_id : match.player2_id;
  const isFillingPlaceholder =
    !currentId && (currentType === 'QUALIFIER' || currentType === 'WILDCARD' || currentType === 'NEXT_GEN');

  const filteredPlayers = players
    .filter((p) => !assignedPlayerIds?.includes(p.id) || p.id.toString() === playerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const options = filteredPlayers.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }));

  function handleSubmit() {
    if (!playerId || !selectedSlot) return;

    startTransition(async () => {
      await updatePlaceholderPlayerAction(match.id, selectedSlot, parseInt(playerId), tournamentId, isLL);
      setOpen(false);
      onSuccess?.();
    });
  }

  const toBeDefined = tBracket('toBeDefined');
  const p1Name = formatPlayerName(match.player1_name, match.player1_seed, match.player1_type, toBeDefined);
  const p2Name = formatPlayerName(match.player2_name, match.player2_seed, match.player2_type, toBeDefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider border-2 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" /> {t('match.replaceLL')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {isFillingPlaceholder ? t('match.definePlayer') : t('match.replacePlayer')}
          </DialogTitle>
          <DialogDescription className="font-bold text-slate-500">
            {t('match.selectSide')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedSlot(1)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all',
                selectedSlot === 1
                  ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-50'
                  : 'border-slate-100 hover:bg-slate-50',
              )}
            >
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {t('match.sideA')}
              </span>
              <span className="text-sm font-black text-center line-clamp-2">{p1Name}</span>
            </button>
            <button
              onClick={() => setSelectedSlot(2)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all',
                selectedSlot === 2
                  ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-50'
                  : 'border-slate-100 hover:bg-slate-50',
              )}
            >
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {t('match.sideB')}
              </span>
              <span className="text-sm font-black text-center line-clamp-2">{p2Name}</span>
            </button>
          </div>

          {selectedSlot && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {t('match.newPlayer')}
                </Label>
                <Combobox
                  options={options}
                  value={playerId}
                  onValueChange={setPlayerId}
                  placeholder={t('match.selectPlayerPlaceholder')}
                  className="h-12"
                />
              </div>

              <div className="flex items-center space-x-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <input
                  type="checkbox"
                  id="isLL"
                  checked={isLL}
                  onChange={(e) => setIsLL(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="isLL" className="text-sm font-black text-slate-700 cursor-pointer">
                  {isFillingPlaceholder ? t('match.enteringAsLL') : t('match.replaceWithLL')}
                </label>
              </div>

              {isLL && (
                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {t('match.llWarning')}
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending || !playerId || !selectedSlot}
          className="w-full h-14 rounded-2xl font-black text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-100"
        >
          {isPending
            ? tButtons('saving')
            : isFillingPlaceholder
              ? t('match.confirmPlayer')
              : t('match.confirmReplace')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function SetResultDialog({
  match,
  tournamentId,
  isFinalRound,
  onSuccess,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  match: BracketMatch;
  tournamentId: number;
  isFinalRound?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const tBracket = useTranslations('bracket');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmCancelPoints, setShowConfirmCancelPoints] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [winnerId, setWinnerId] = useState<string>(match.winner_id?.toString() || '');
  const [score, setScore] = useState(match.score || '');
  const initialResult = getMatchResultMode(match.score);
  const [resultMode, setResultMode] = useState<MatchResultMode>(initialResult.mode);
  const [woPartialScore, setWoPartialScore] = useState(initialResult.partialScore);

  useEffect(() => {
    if (open) {
      setWinnerId(match.winner_id?.toString() || '');
      setScore(match.score || '');
      const result = getMatchResultMode(match.score);
      setResultMode(result.mode);
      setWoPartialScore(result.partialScore);
      setError(null);
      setSuccess(false);
      setShowConfirmClear(false);
      setShowConfirmCancelPoints(false);
    }
  }, [open, match]);

  function handleClearResult() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await clearMatchResultAction(match.id, tournamentId);
      if (result.success) {
        setSuccess(true);
        setShowConfirmClear(false);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          onSuccess?.();
        }, 1000);
      } else {
        setError(result.error || t('match.errorClearResult'));
        setShowConfirmClear(false);
      }
    });
  }

  function handleCancelPoints(cancelled: boolean) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await cancelMatchPointsAction(match.id, cancelled, tournamentId);
      if (result.success) {
        setSuccess(true);
        setShowConfirmCancelPoints(false);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          onSuccess?.();
        }, 1000);
      } else {
        setError(result.error || t('match.errorChangePoints'));
        setShowConfirmCancelPoints(false);
      }
    });
  }

  function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!winnerId) {
      setError(t('match.errorSelectWinner'));
      return;
    }

    // RET is stored as W/O with a partial score for compatibility with existing matches.
    let finalScore = score;
    if (resultMode === 'walkover') {
      finalScore = 'W/O';
    } else if (resultMode === 'retired') {
      finalScore = woPartialScore.trim() ? `W/O ${woPartialScore.trim()}` : '';
    }

    if (!finalScore) {
      setError(resultMode === 'retired' ? t('match.errorPartialScore') : t('match.errorSelectScore'));
      return;
    }

    startTransition(async () => {
      const result = await setMatchResultAction(match.id, parseInt(winnerId), finalScore.trim(), tournamentId);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setWinnerId('');
          onSuccess?.();
        }, 1000);
      } else {
        setError(result.error || t('match.errorSave'));
      }
    });
  }

  const toBeDefined = tBracket('toBeDefined');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-[10px] h-8 rounded-xl font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
          >
            <Trophy className="w-3 h-3 mr-1.5" />{' '}
            {match.status === 'completed' ? t('match.change') : t('match.result')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {match.status === 'completed' ? t('match.changeResult') : t('match.registerResult')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-center flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                {t('match.playerA')}
              </p>
              <p className="font-bold text-slate-700">
                {formatPlayerName(match.player1_name, match.player1_seed, match.player1_type, toBeDefined)}
              </p>
            </div>
            <div className="px-4 text-slate-300 font-black italic text-xl">VS</div>
            <div className="text-center flex-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                {t('match.playerB')}
              </p>
              <p className="font-bold text-slate-700">
                {formatPlayerName(match.player2_name, match.player2_seed, match.player2_type, toBeDefined)}
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border-2 border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border-2 border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              {t('match.resultSaved')}
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              {t('match.selectWinner')}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  winnerId === match.player1_id?.toString()
                    ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player1_id?.toString()}
                  onChange={() => setWinnerId(match.player1_id?.toString() || '')}
                  className="hidden"
                />
                <span className="text-sm font-black text-center">
                  {formatPlayerName(match.player1_name, match.player1_seed, match.player1_type, toBeDefined)}
                </span>
                {winnerId === match.player1_id?.toString() && (
                  <Badge className="bg-emerald-500">{t('match.winnerBadge')}</Badge>
                )}
              </label>
              <label
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  winnerId === match.player2_id?.toString()
                    ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="winner_radio"
                  checked={winnerId === match.player2_id?.toString()}
                  onChange={() => setWinnerId(match.player2_id?.toString() || '')}
                  className="hidden"
                />
                <span className="text-sm font-black text-center">
                  {formatPlayerName(match.player2_name, match.player2_seed, match.player2_type, toBeDefined)}
                </span>
                {winnerId === match.player2_id?.toString() && (
                  <Badge className="bg-emerald-500">{t('match.winnerBadge')}</Badge>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              {t('match.finalScore')}
            </Label>
            
            {/* Result mode */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={resultMode === 'regular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (resultMode !== 'regular') {
                    setScore(resultMode === 'retired' ? woPartialScore : '');
                  }
                  setResultMode('regular');
                }}
                className={`text-[10px] h-7 rounded-lg font-bold ${
                  resultMode === 'regular'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }`}
              >
                {t('match.normal')}
              </Button>
              <Button
                type="button"
                variant={resultMode === 'walkover' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (resultMode === 'regular') {
                    setWoPartialScore(score.replace(/^W\/O\s*/i, '').trim());
                    setScore('');
                  }
                  setResultMode('walkover');
                }}
                className={`text-[10px] h-7 rounded-lg font-bold ${
                  resultMode === 'walkover'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : ''
                }`}
              >
                W/O
              </Button>
              <Button
                type="button"
                variant={resultMode === 'retired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (resultMode === 'regular') {
                    setWoPartialScore(score.replace(/^W\/O\s*/i, '').trim());
                    setScore('');
                  }
                  setResultMode('retired');
                }}
                className={`text-[10px] h-7 rounded-lg font-bold ${
                  resultMode === 'retired'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : ''
                }`}
              >
                RET
              </Button>
              <p className="basis-full sm:basis-auto sm:ml-auto text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {resultMode === 'retired'
                  ? t('match.partialScoreRequired')
                  : resultMode === 'walkover'
                    ? t('match.noScore')
                    : t('match.setsHint')}
              </p>
            </div>

            {/* Regular Score Input or RET Partial Score Input */}
            {resultMode === 'retired' ? (
              <Input
                value={woPartialScore}
                onChange={(e) => setWoPartialScore(e.target.value)}
                placeholder={t('match.partialScorePlaceholder')}
                required
                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-orange-600 text-lg font-black tracking-widest"
              />
            ) : resultMode === 'walkover' ? (
              <div className="h-14 rounded-2xl border-2 border-amber-100 bg-amber-50 text-amber-700 flex items-center px-4 text-sm font-black uppercase tracking-widest">
                {t('match.woNoScore')}
              </div>
            ) : (
              <Input
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder=""
                required
                autoFocus={false}
                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 text-lg font-black tracking-widest"
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
              disabled={isPending || success}
              autoFocus={true}
            >
              {isPending
                ? tButtons('saving')
                : success
                  ? t('match.success')
                  : t('match.confirmResult')}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmCancelPoints(true)}
                disabled={isPending || success}
                className={`h-12 rounded-2xl font-bold border-2 ${
                  match.points_cancelled
                    ? 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                    : 'text-amber-600 border-amber-100 hover:bg-amber-50'
                }`}
              >
                {match.points_cancelled ? t('match.reactivatePoints') : t('match.cancelPoints')}
              </Button>

              {match.status === 'completed' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmClear(true)}
                  disabled={isPending || success}
                  className="h-12 rounded-2xl font-bold border-2 text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                >
                  {t('match.clear')}
                </Button>
              )}
            </div>
          </div>
        </form>

        <Dialog open={showConfirmCancelPoints} onOpenChange={setShowConfirmCancelPoints}>
          <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
            <DialogHeader className="pt-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm ${
                  match.points_cancelled ? 'bg-emerald-100' : 'bg-amber-100'
                }`}
              >
                <AlertCircle className={`w-8 h-8 ${match.points_cancelled ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-900">
                {match.points_cancelled
                  ? t('match.reactivatePointsTitle')
                  : t('match.cancelPointsTitle')}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 font-medium px-4">
                {match.points_cancelled
                  ? t('match.reactivatePointsDesc')
                  : t('match.cancelPointsDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmCancelPoints(false)}
                className="flex-1 rounded-xl font-bold h-12 border-2"
              >
                {tButtons('cancel')}
              </Button>
              <Button
                onClick={() => handleCancelPoints(!match.points_cancelled)}
                className={`flex-1 rounded-xl font-black h-12 text-white shadow-lg ${
                  match.points_cancelled
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                }`}
              >
                {t('match.yes')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
          <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
            <DialogHeader className="pt-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-900">
                {t('match.clearResultTitle')}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 font-medium px-4">
                {t('match.clearResultDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 rounded-xl font-bold h-12 border-2"
              >
                {tButtons('cancel')}
              </Button>
              <Button
                onClick={() => handleClearResult()}
                className="flex-1 rounded-xl font-black h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
              >
                {t('match.yes')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
</DialogContent>
    </Dialog>
  );
}
