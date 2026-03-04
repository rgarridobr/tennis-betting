'use client'

import React, { useEffect } from "react"
import { useState } from 'react'
import type { BracketMatch, Player } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Pencil, Trophy, AlertCircle } from 'lucide-react'
import { SetPlayersDialog, ReplacePlaceholderDialog, SetResultDialog } from './match-dialogs'

interface Props {
  round: number
  roundName: string
  matches: BracketMatch[]
  players: Player[]
  tournamentId: number
  tournamentStatus: string
  isFinalRound?: boolean
  assignedPlayerIds?: number[]
}

export function BracketRoundManager({ round, roundName, matches, players, tournamentId, tournamentStatus, isFinalRound, assignedPlayerIds }: Props) {
  const [expanded, setExpanded] = useState(round === 1)
  const completed = matches.filter(m => m.status === 'completed').length
  const scheduled = matches.filter(m => m.status === 'scheduled').length
  const pending = matches.filter(m => m.status === 'pending').length

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{roundName}</CardTitle>
            <Badge variant="outline" className="text-xs">{matches.length} partidas</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              {completed > 0 && <span className="text-emerald-600 font-medium">{completed} finalizadas</span>}
              {scheduled > 0 && <span className="text-blue-600 font-medium">{scheduled} agendadas</span>}
              {pending > 0 && <span className="text-slate-400 font-medium">{pending} pendentes</span>}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                players={players}
                tournamentId={tournamentId}
                tournamentStatus={tournamentStatus}
                isFinalRound={isFinalRound}
                assignedPlayerIds={assignedPlayerIds}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function MatchCard({
  match,
  players,
  tournamentId,
  tournamentStatus,
  isFinalRound,
  assignedPlayerIds
}: {
  match: BracketMatch;
  players: Player[];
  tournamentId: number;
  tournamentStatus: string;
  isFinalRound?: boolean;
  assignedPlayerIds?: number[];
}) {
  const hasPlayers = (match.player1_id || match.player1_type !== 'PLAYER') &&
                    (match.player2_id || match.player2_type !== 'PLAYER')
  const isCompleted = match.status === 'completed'
  const isPublished = tournamentStatus === 'active' || tournamentStatus === 'published' || tournamentStatus === 'OPEN'
  const isDraft = tournamentStatus === 'draft' || tournamentStatus === 'STANDBY' || tournamentStatus === 'UPCOMING' || tournamentStatus === 'upcoming'
  const isLocked = tournamentStatus === 'finished' || tournamentStatus === 'completed' || tournamentStatus === 'FINISHED'
  const canEditPlayers = isDraft && match.round === 1;

  const getPlayerDisplay = (playerId: number | null, name: string | null, type: string, seedNum: number | null) => {
    const isPlaceholder = !playerId && type !== 'PLAYER' && type !== 'BYE';
    const displayName = name || (
      type === 'QUALIFIER' ? 'Qualifier' :
      type === 'WILDCARD' ? 'Wild Card' :
      type === 'BYE' ? 'BYE' :
      'A definir'
    );

    const getIndicator = () => {
      if (isPlaceholder) return null;
      if (type === 'SEED' && seedNum) return `(${seedNum})`;
      if (type === 'QUALIFIER') return '(Q)';
      if (type === 'WILDCARD') return '(WC)';
      return null;
    };

    const indicator = getIndicator();

    if (type === 'BYE') return <span className="text-slate-400 italic font-medium">BYE</span>;

    return (
      <span className={isPlaceholder ? (type === 'QUALIFIER' ? "text-amber-600 italic font-bold" : "text-blue-600 italic font-bold") : "text-slate-700"}>
        {displayName}
        {indicator && <span className="text-[10px] text-slate-400 ml-1 font-bold">{indicator}</span>}
      </span>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all group ${
      isCompleted ? 'border-emerald-100 bg-emerald-50/30' :
      hasPlayers ? 'border-blue-100 bg-blue-50/30' :
      'border-slate-100 bg-slate-50/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Jogo {match.position}</span>
        {isCompleted ? (
          <Badge className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0 rounded-full">FINALIZADO</Badge>
        ) : match.status === 'scheduled' ? (
          <Badge className="bg-blue-500 text-white text-[10px] font-black px-2 py-0 rounded-full">AGENDADO</Badge>
        ) : (
          <Badge className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0 rounded-full">PENDENTE</Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Player 1 */}
        {canEditPlayers ? (
          <SetPlayersDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            trigger={
              <div
                role="button"
                tabIndex={0}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/50 transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isCompleted && match.winner_id === match.player1_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
              }`}>
                <div className={`flex items-center gap-2 text-sm truncate ${
                  isCompleted && match.winner_id === match.player1_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
                }`}>
                  {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
                </div>
                {isCompleted && match.winner_id === match.player1_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
                <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            }
          />
        ) : !isDraft && (match.player1_type === 'QUALIFIER' || match.player1_type === 'WILDCARD') && !match.player1_id ? (
          <ReplacePlaceholderDialog
            match={match}
            slot={1}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            trigger={
              <div className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors border border-dashed border-amber-300">
                <div className="flex items-center gap-2 text-sm truncate font-bold text-amber-700">
                  {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
                </div>
                <Pencil className="w-3 h-3 text-amber-500" />
              </div>
            }
          />
        ) : (
          <div className={`flex items-center justify-between p-2 rounded-xl ${
            isCompleted && match.winner_id === match.player1_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
          }`}>
            <div className={`flex items-center gap-2 text-sm truncate ${
              isCompleted && match.winner_id === match.player1_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
            }`}>
              {getPlayerDisplay(match.player1_id, match.player1_name, match.player1_type, match.player1_seed)}
            </div>
            {isCompleted && match.winner_id === match.player1_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        )}

        {/* Player 2 */}
        {canEditPlayers ? (
          <SetPlayersDialog
            match={match}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            trigger={
              <div
                role="button"
                tabIndex={0}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/50 transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isCompleted && match.winner_id === match.player2_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
              }`}>
                <div className={`flex items-center gap-2 text-sm truncate ${
                  isCompleted && match.winner_id === match.player2_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
                }`}>
                  {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
                </div>
                {isCompleted && match.winner_id === match.player2_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
                <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            }
          />
        ) : !isDraft && (match.player2_type === 'QUALIFIER' || match.player2_type === 'WILDCARD') && !match.player2_id ? (
          <ReplacePlaceholderDialog
            match={match}
            slot={2}
            players={players}
            tournamentId={tournamentId}
            assignedPlayerIds={assignedPlayerIds}
            trigger={
              <div className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors border border-dashed border-amber-300">
                <div className="flex items-center gap-2 text-sm truncate font-bold text-amber-700">
                  {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
                </div>
                <Pencil className="w-3 h-3 text-amber-500" />
              </div>
            }
          />
        ) : (
          <div className={`flex items-center justify-between p-2 rounded-xl ${
            isCompleted && match.winner_id === match.player2_id ? 'bg-emerald-100/50 ring-1 ring-emerald-200' : ''
          }`}>
            <div className={`flex items-center gap-2 text-sm truncate ${
              isCompleted && match.winner_id === match.player2_id ? 'font-black text-emerald-900' : 'font-bold text-slate-700'
            }`}>
              {getPlayerDisplay(match.player2_id, match.player2_name, match.player2_type, match.player2_seed)}
            </div>
            {isCompleted && match.winner_id === match.player2_id && <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />}
          </div>
        )}
      </div>

      {/* Score */}
      {isCompleted && match.score && (
        <div className="mt-3 py-1 px-3 bg-white/50 rounded-lg border border-emerald-100 inline-block">
          <p className="text-[11px] font-black text-emerald-700 tracking-widest">{match.score}</p>
        </div>
      )}

      {/* Actions */}
      {!isLocked && (
        <div className="mt-4 flex gap-2">
          {canEditPlayers && (
            <SetPlayersDialog match={match} players={players} tournamentId={tournamentId} assignedPlayerIds={assignedPlayerIds} />
          )}
          {isPublished && (
            <>
              {(match.player1_type === 'QUALIFIER' || match.player1_type === 'WILDCARD') && !match.player1_id && (
                <ReplacePlaceholderDialog match={match} slot={1} players={players} tournamentId={tournamentId} assignedPlayerIds={assignedPlayerIds} />
              )}
              {(match.player2_type === 'QUALIFIER' || match.player2_type === 'WILDCARD') && !match.player2_id && (
                <ReplacePlaceholderDialog match={match} slot={2} players={players} tournamentId={tournamentId} assignedPlayerIds={assignedPlayerIds} />
              )}
              {match.player1_id && match.player2_id && (
                <SetResultDialog match={match} tournamentId={tournamentId} isFinalRound={isFinalRound} />
              )}
            </>
          )}
          {!isPublished && !isDraft && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
              <AlertCircle className="w-3 h-3" />
              Publique para lançar resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}

