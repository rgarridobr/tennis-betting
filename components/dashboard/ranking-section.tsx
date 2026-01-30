import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import type { RankingEntry } from '@/lib/data'

interface RankingSectionProps {
  ranking: RankingEntry[]
  currentUserId?: number
}

export function RankingSection({ ranking, currentUserId }: RankingSectionProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-amber-500" />
          Ranking Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum participante ainda
          </p>
        ) : (
          ranking.slice(0, 5).map((entry) => {
            const isCurrentUser = currentUserId === entry.user_id
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrentUser ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.rank === 1 
                      ? 'bg-amber-400 text-white' 
                      : entry.rank === 2 
                        ? 'bg-slate-400 text-white' 
                        : entry.rank === 3 
                          ? 'bg-orange-400 text-white' 
                          : 'bg-slate-200 text-slate-600'
                  }`}>
                    {entry.rank}
                  </div>
                  <div>
                    <p className={`font-medium ${isCurrentUser ? 'text-emerald-700' : 'text-foreground'}`}>
                      {entry.user_name}
                      {isCurrentUser && <span className="text-xs text-emerald-600 ml-1">(você)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.correct_predictions} acertos  {entry.total_predictions} palpites
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isCurrentUser ? 'text-emerald-600' : 'text-foreground'}`}>
                    {entry.total_points}
                  </p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
