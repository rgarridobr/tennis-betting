import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react'
import type { UserStats } from '@/lib/data'

interface StatsCardsProps {
  stats: UserStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Seus Pontos',
      value: stats.total_points,
      icon: Trophy,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-600',
      type: 'points'
    },
    {
      label: 'Acertos',
      value: stats.correct_predictions,
      subtext: `de ${stats.total_predictions} palpites`,
      icon: Target,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-600',
      type: 'hits'
    },
    {
      label: 'Precisão',
      value: `${stats.accuracy}%`,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-600',
      type: 'accuracy'
    },
    {
      label: 'Torneios',
      value: stats.active_tournaments,
      subtext: 'em andamento',
      icon: Calendar,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50',
      valueColor: 'text-violet-600',
      type: 'count'
    },
  ]

  const hasMultipleTournaments = stats.tournament_stats && stats.tournament_stats.length > 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 -mt-12 relative z-10 py-2 px-4">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`border-0 shadow-lg rounded-[2rem] bg-white transition-all hover:shadow-xl duration-300`}
        >
          <CardContent className="p-3 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-wider">{card.label}</p>
              
              {hasMultipleTournaments && card.type !== 'count' ? (
                <div className="mt-1 space-y-1">
                  {stats.tournament_stats?.map((ts) => (
                    <div key={ts.tournament_id} className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[130px]">
                        {ts.tournament_name}
                      </span>
                      <span className={`text-[11px] font-black ${card.valueColor}`}>
                        {card.type === 'points' && ts.points}
                        {card.type === 'hits' && `${ts.correct_predictions}/${ts.total_predictions}`}
                        {card.type === 'accuracy' && `${ts.accuracy}%`}
                      </span>
                    </div>
                  ))}
                  <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total</span>
                    <p className={`text-lg font-black ${card.valueColor}`}>
                      {card.value}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <p className={`text-2xl font-black ${card.valueColor}`}>
                    {card.value}
                  </p>
                  {card.subtext && (
                    <p className="text-[10px] font-bold text-slate-400 truncate">{card.subtext}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
