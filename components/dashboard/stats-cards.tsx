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
      highlightBg: 'bg-amber-50/50',
      highlightRing: 'ring-amber-100',
    },
    {
      label: 'Acertos',
      value: stats.correct_predictions,
      subtext: `de ${stats.total_predictions} palpites`,
      icon: Target,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-600',
      highlightBg: 'bg-emerald-50/50',
      highlightRing: 'ring-emerald-100',
    },
    {
      label: 'Precisão',
      value: `${stats.accuracy}%`,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-600',
      highlightBg: 'bg-blue-50/50',
      highlightRing: 'ring-blue-100',
    },
    {
      label: 'Torneios',
      value: stats.active_tournaments,
      subtext: 'em andamento',
      icon: Calendar,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50',
      valueColor: 'text-violet-600',
      highlightBg: 'bg-violet-50/50',
      highlightRing: 'ring-violet-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-12 relative z-10">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`border-0 shadow-lg rounded-[2rem] bg-white transition-all hover:shadow-xl duration-300`}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-wider">{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-black ${card.valueColor}`}>
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="text-[10px] font-bold text-slate-400 truncate">{card.subtext}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
