'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Target, TrendingUp, Crown, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import type { RankingEntry } from '@/lib/data';
import Link from 'next/link';

interface TournamentRankingProps {
  ranking: RankingEntry[];
  currentUserId: number;
  tournamentId: number;
  hasStarted: boolean;
}

export function TournamentRanking({ ranking, currentUserId, tournamentId, hasStarted }: TournamentRankingProps) {
  if (ranking.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white rounded-[2.5rem]">
        <CardContent className="py-16 text-center">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nenhum palpite ainda</h2>
          <p className="text-slate-500">As classificações aparecerão assim que os resultados forem lançados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Full List */}
      <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            Classificação Completa
          </h3>
          <Badge variant="outline" className="font-bold">
            {ranking.length} participantes
          </Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {ranking.map((entry) => (
              <RankingRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === currentUserId}
                tournamentId={tournamentId}
                hasStarted={hasStarted}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RankingRow({
  entry,
  isCurrentUser,
  tournamentId,
  hasStarted,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
  tournamentId: number;
  hasStarted: boolean;
}) {
  const accuracy =
    entry.total_predictions > 0 ? Math.round((entry.correct_predictions / entry.total_predictions) * 100) : 0;

  const canViewBracket = hasStarted && !isCurrentUser;

  const Content = (
    <div
      className={`flex items-center justify-between px-8 py-6 transition-colors ${isCurrentUser ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'} ${canViewBracket ? 'cursor-pointer group' : 'cursor-not-allowed'}`}
    >
      <div className="flex items-center gap-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
            entry.rank === 1
              ? 'bg-amber-400 text-white'
              : entry.rank === 2
                ? 'bg-slate-400 text-white'
                : entry.rank === 3
                  ? 'bg-orange-400 text-white'
                  : 'bg-slate-100 text-slate-500'
          }`}
        >
          {entry.rank}
        </div>
        <div>
          <p className="font-black text-slate-900 flex items-center gap-2 leading-none mb-1.5">
            {entry.user_name}
            {isCurrentUser && (
              <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] h-4">VOCÊ</Badge>
            )}
            {entry.hit_champion && (
              <span title={entry.hit_both ? "Acertou Campeão e Vice" : "Acertou o Campeão"}>
                <Trophy className={`w-4 h-4 ${entry.hit_both ? 'text-amber-500' : 'text-emerald-500'}`} />
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {entry.correct_predictions}/{entry.total_predictions} ACERTOS
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {accuracy}% PRECISÃO
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900 leading-none">{entry.total_points}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pontos</p>
        </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />

      </div>
    </div>
  );

  if (canViewBracket) {
    return <Link href={`/torneios/${tournamentId}?view=ranking&viewUser=${entry.user_id}`}>{Content}</Link>;
  }

  return Content;
}
