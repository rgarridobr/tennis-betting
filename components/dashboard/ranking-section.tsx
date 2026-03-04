import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { RankingEntry } from '@/lib/data';

interface RankingSectionProps {
  ranking: RankingEntry[];
  currentUserId?: number;
}

export function RankingSection({ ranking, currentUserId }: RankingSectionProps) {
  return (
    <Card className="border-0 shadow-xl rounded-[2rem] bg-white">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
          <Trophy className="w-6 h-6 text-amber-500" />
          Ranking Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum participante ainda</p>
        ) : (
          ranking.slice(0, 5).map((entry) => {
            const isCurrentUser = currentUserId === entry.user_id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  isCurrentUser
                    ? 'bg-emerald-50/50 border-2 border-emerald-500'
                    : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-white'
                        : entry.rank === 2
                          ? 'bg-slate-400 text-white'
                          : entry.rank === 3
                            ? 'bg-orange-400 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div>
                    <p className={`font-bold text-base ${isCurrentUser ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {entry.user_name.charAt(0).toUpperCase() +
                        entry.user_name.slice(1).toLowerCase().split(' ')[0] +
                        (entry.user_name.split(' ').length > 1
                          ? ' ' + entry.user_name.split(' ')[1].charAt(0).toUpperCase() + '.'
                          : '')}
                      {isCurrentUser && <span className="text-xs text-emerald-600 ml-1.5 font-medium">(você)</span>}
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      {entry.correct_predictions} acertos • {entry.total_predictions} palpites
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${isCurrentUser ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {entry.total_points}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">pontos</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
