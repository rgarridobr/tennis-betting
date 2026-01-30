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
      iconColor: 'text-white',
      bgColor: 'bg-orange-500',
      valueColor: 'text-orange-600',
      highlightBg: 'bg-orange-50',
      highlightRing: 'ring-orange-200',
    },
    {
      label: 'Acertos',
      value: stats.correct_predictions,
      subtext: `de ${stats.total_predictions} palpites`,
      icon: Target,
      iconColor: 'text-white',
      bgColor: 'bg-emerald-500',
      valueColor: 'text-emerald-600',
      highlightBg: 'bg-emerald-50',
      highlightRing: 'ring-emerald-200',
    },
    {
      label: 'Precisão',
      value: `${stats.accuracy}%`,
      icon: TrendingUp,
      iconColor: 'text-white',
      bgColor: 'bg-blue-500',
      valueColor: 'text-blue-600',
      highlightBg: 'bg-blue-50',
      highlightRing: 'ring-blue-200',
    },
    {
      label: 'Torneios',
      value: stats.active_tournaments,
      subtext: 'em andamento',
      icon: Calendar,
      iconColor: 'text-white',
      bgColor: 'bg-violet-500',
      valueColor: 'text-violet-600',
      highlightBg: 'bg-violet-50',
      highlightRing: 'ring-violet-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-12 relative z-10">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className={`border-0 shadow-md ${card.highlightBg ? `${card.highlightBg} ring-1 ${card.highlightRing}` : 'bg-card'}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${card.valueColor} mt-1`}>
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
