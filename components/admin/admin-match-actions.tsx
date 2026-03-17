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
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
    !isCompleted &&
    (match.round === 1 ||
      ((match.player1_type === 'QUALIFIER' ||
        match.player1_type === 'WILDCARD' ||
        match.player1_type === 'LUCKY_LOSER') &&
        !match.player1_id) ||
      ((match.player2_type === 'QUALIFIER' ||
        match.player2_type === 'WILDCARD' ||
        match.player2_type === 'LUCKY_LOSER') &&
        !match.player2_id));

  const showResult = isPublished && match.player1_id && match.player2_id;

  const content = (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {canEditPlayers && (
          <SetPlayersDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            onSuccess={() => setOpen(false)}
            trigger={
              <button className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Pencil className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900">Definir Confronto</p>
                  <p className="text-xs font-bold text-slate-500">Configure os jogadores para esta partida.</p>
                </div>
              </button>
            }
          />
        )}

        {showReplace && (
          <ReplaceMatchPlayerDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            onSuccess={() => setOpen(false)}
            trigger={
              <button className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-all group text-rose-700">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <RefreshCw className="w-6 h-6 text-rose-600" />
                </div>
                <div className="text-left">
                  <p className="font-black">Substituir / LL</p>
                  <p className="text-xs font-bold text-rose-600/70">Substitua um jogador ou adicione um Lucky Loser.</p>
                </div>
              </button>
            }
          />
        )}

        {showResult && (
          <SetResultDialog
            match={match}
            tournamentId={tournamentId}
            isFinalRound={isFinalRound}
            onSuccess={() => setOpen(false)}
            trigger={
              <button className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 transition-all group text-emerald-700">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-black">Registrar Resultado</p>
                  <p className="text-xs font-bold text-emerald-600/70">Defina o vencedor e o placar da partida.</p>
                </div>
              </button>
            }
          />
        )}

        {!canEditPlayers && !showReplace && !showResult && (
          <div className="p-8 text-center space-y-2">
            <Settings2 className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="font-black text-slate-400">Nenhuma ação disponível</p>
            <p className="text-xs font-bold text-slate-400/70">
              Esta partida já foi concluída ou o torneio está finalizado.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const title = `Gerenciar Jogo ${match.position}`;
  const description = `${match.player1_name || 'A definir'} vs ${match.player2_name || 'A definir'}`;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
              <Settings2 className="w-5 h-5" />
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-black">{title}</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold">{description}</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-2">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
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
  );
}
