'use client';

import React, { useState } from 'react';
import type { BracketMatch, Player } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { SetPlayersDialog, ReplaceMatchPlayerDialog, SetResultDialog } from './match-dialogs';
import { Trophy, RefreshCw, Pencil, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdminMatchActionsProps {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  assignedPlayerIds?: number[];
  isFinalRound?: boolean;
  tournamentStatus?: string;
  trigger?: React.ReactNode;
}

export function AdminMatchActions({
  match,
  players,
  tournamentId,
  assignedPlayerIds,
  isFinalRound,
  tournamentStatus,
  trigger,
}: AdminMatchActionsProps) {
  const t = useTranslations('admin');
  const tBracket = useTranslations('bracket');
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<'players' | 'replace' | 'result' | null>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleActionClick = (action: 'players' | 'replace' | 'result') => {
    setOpen(false);
    setTimeout(() => {
      setActiveAction(action);
    }, 400); // Wait for Drawer/Dialog close animation
  };

  const isPublished =
    tournamentStatus === 'active' ||
    tournamentStatus === 'published' ||
    tournamentStatus === 'OPEN' ||
    tournamentStatus === 'LOCKED' ||
    tournamentStatus === 'IN_PROGRESS';
  const isDraft =
    tournamentStatus === 'draft' ||
    tournamentStatus === 'STANDBY' ||
    tournamentStatus === 'UPCOMING' ||
    tournamentStatus === 'upcoming';
  const isCompleted = match.status === 'completed';

  const canEditPlayers = isDraft && match.round === 1;

  const showReplace =
    isPublished &&
    (match.round === 1 ||
      (!isCompleted &&
        (((match.player1_type === 'QUALIFIER' ||
          match.player1_type === 'WILDCARD' ||
          match.player1_type === 'LUCKY_LOSER') &&
          !match.player1_id) ||
          ((match.player2_type === 'QUALIFIER' ||
            match.player2_type === 'WILDCARD' ||
            match.player2_type === 'LUCKY_LOSER') &&
            !match.player2_id))));

  const showResult = isPublished && match.player1_id && match.player2_id;

  const content = (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {canEditPlayers && (
          <button 
            type="button"
            onClick={() => handleActionClick('players')}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
              <Pencil className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-left">
              <p className="font-black text-slate-900">{t('match.setMatchup')}</p>
              <p className="text-xs font-bold text-slate-500">{t('match.setMatchupDesc')}</p>
            </div>
          </button>
        )}

        {showReplace && (
          <button 
            type="button"
            onClick={() => handleActionClick('replace')}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-all group text-rose-700"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-white transition-colors">
              <RefreshCw className="w-6 h-6 text-rose-600" />
            </div>
            <div className="text-left">
              <p className="font-black">{t('match.replaceLL')}</p>
              <p className="text-xs font-bold text-rose-600/70">
                {t('match.replaceLLDesc')}
              </p>
            </div>
          </button>
        )}

        {showResult && (
          <button 
            type="button"
            onClick={() => handleActionClick('result')}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-all group text-emerald-700"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-white transition-colors">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="font-black">
                {isCompleted ? t('match.changeResult') : t('match.registerResult')}
              </p>
              <p className="text-xs font-bold text-emerald-600/70">
                {isCompleted ? t('match.changeResultDesc') : t('match.registerResultDesc')}
              </p>
            </div>
          </button>
        )}

        {!canEditPlayers && !showReplace && !showResult && (
          <div className="p-8 text-center space-y-2">
            <Settings2 className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="font-black text-slate-400">{t('match.noActions')}</p>
            <p className="text-xs font-bold text-slate-400/70">
              {t('match.noActionsDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const title = t('match.manageGame', { position: match.position });
  const description = `${match.player1_name || tBracket('toBeDefined')} vs ${match.player2_name || tBracket('toBeDefined')}`;

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {trigger || (
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <Settings2 className="w-5 h-5" />
              </button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold">{description}</DialogDescription>
            </DialogHeader>
            <div className="p-2">{content}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false} repositionInputs={false}>
          <DrawerTrigger asChild>
            {trigger || (
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <Settings2 className="w-5 h-5" />
              </button>
            )}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left px-6 pt-6">
              <DrawerTitle className="text-2xl font-black">{title}</DrawerTitle>
              <DrawerDescription className="text-slate-500 font-bold">{description}</DrawerDescription>
            </DrawerHeader>
            <div className="pb-8">{content}</div>
          </DrawerContent>
        </Drawer>
      )}

      <SetPlayersDialog
        match={match}
        players={players}
        tournamentId={tournamentId}
        assignedPlayerIds={assignedPlayerIds}
        open={activeAction === 'players'}
        onOpenChange={(val) => { if (!val) setActiveAction(null); }}
        onSuccess={() => setActiveAction(null)}
        trigger={<button className="hidden" />}
      />

      <ReplaceMatchPlayerDialog
        match={match}
        players={players}
        tournamentId={tournamentId}
        assignedPlayerIds={assignedPlayerIds}
        open={activeAction === 'replace'}
        onOpenChange={(val) => { if (!val) setActiveAction(null); }}
        onSuccess={() => setActiveAction(null)}
        trigger={<button className="hidden" />}
      />

      <SetResultDialog
        match={match}
        tournamentId={tournamentId}
        isFinalRound={isFinalRound}
        open={activeAction === 'result'}
        onOpenChange={(val) => { if (!val) setActiveAction(null); }}
        onSuccess={() => setActiveAction(null)}
        trigger={<button className="hidden" />}
      />
    </>
  );
}
