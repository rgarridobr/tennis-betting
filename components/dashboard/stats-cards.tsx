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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`border-0 shadow-xl rounded-[2rem] bg-white transition-transform hover:scale-[1.02] duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <div className={`p-3 rounded-2xl ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>

              <div>
                <p className={`text-4xl font-black ${card.valueColor}`}>
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="text-xs font-semibold text-slate-400 mt-1">{card.subtext}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
