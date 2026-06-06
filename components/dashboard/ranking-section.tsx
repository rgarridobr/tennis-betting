import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Trophy } from 'lucide-react';
import type { RankingEntry } from '@/lib/data';

interface RankingSectionProps {
  ranking: RankingEntry[];
  currentUserId?: number;
}

export function RankingSection({ ranking, currentUserId }: RankingSectionProps) {
  return (
    <Card className="pt-0 border-0 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-200/50">
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b flex justify-between items-center">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-amber-500" />
          Ranking Geral
        </h2>
        {ranking.length > 0 && (
          <Badge variant="outline" className="bg-white font-medium text-slate-500 border-slate-200">
            Top 5
          </Badge>
        )}
      </div>
      <CardContent className="p-0">
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum participante ainda</p>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {ranking.slice(0, 5).map((entry) => {
              const isCurrentUser = currentUserId === entry.user_id;
              const accuracy =
                entry.total_predictions > 0
                  ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
                  : 0;

              return (
                <div
                  key={entry.user_id}
                  className={`group flex items-center justify-between px-6 py-4 transition-all hover:bg-slate-50/80 ${
                    isCurrentUser ? 'bg-emerald-50/50 shadow-sm relative z-10' : ''
                  }`}
                >
                  <div className="flex items-center gap-5">
                    {/* Position */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-sm transition-transform group-hover:scale-105 shrink-0 ${
                        entry.rank === 1
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-amber-500/20'
                          : entry.rank === 2
                            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-slate-400/20'
                            : entry.rank === 3
                              ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-orange-500/20'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {entry.rank}
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className={`font-bold text-base flex items-center gap-2 truncate ${isCurrentUser ? 'text-emerald-800' : 'text-slate-900'}`}>
                        <span className="truncate">
                          {entry.user_name.charAt(0).toUpperCase() +
                            entry.user_name.slice(1).toLowerCase().split(' ')[0] +
                            (entry.user_name.split(' ').length > 1
                              ? ' ' + entry.user_name.split(' ')[1].charAt(0).toUpperCase() + '.'
                              : '')}
                        </span>
                        {isCurrentUser && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 h-auto shrink-0">
                            Você
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5 text-emerald-700 px-2 py-1 rounded-md whitespace-nowrap">
                          <Target className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-emerald-600">{entry.correct_predictions}/{entry.total_predictions}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-700 px-2 py-1 rounded-md whitespace-nowrap">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-bold text-blue-600">{accuracy}%</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex flex-col items-end shrink-0 ml-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Pontos</span>
                    <p className={`text-2xl font-black tabular-nums tracking-tight leading-none ${isCurrentUser ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {entry.total_points}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
