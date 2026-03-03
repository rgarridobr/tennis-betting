import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGlobalRanking, getUserStats } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Target, TrendingUp, Crown, Award } from 'lucide-react'

export default async function RankingPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [ranking, userStats] = await Promise.all([
    getGlobalRanking(100),
    getUserStats(user.id),
  ])

  // Find current user's position
  const userRankEntry = ranking.find(r => r.user_id === user.id)
  const userPosition = userRankEntry?.rank || '-'

  // Top 3 for podium
  const top3 = ranking.slice(0, 3)
  const restRanking = ranking.slice(3)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      
      {/* Header */}
      <PageHero title="Ranking Geral" subtitle="Veja quem está liderando o bolão">
        <Card className="bg-white/10 border-0 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{userPosition}º</span>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Sua posição</p>
              <p className="text-white font-semibold">{user.nickname || user.name}</p>
              <p className="text-amber-300 font-bold">{userStats.total_points} pontos</p>
            </div>
          </CardContent>
        </Card>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        {ranking.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum participante ainda</h2>
              <p className="text-slate-600">
                Seja o primeiro a participar de um torneio!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Podium - Top 3 */}
            {top3.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="order-2 md:order-1">
                  <PodiumCard 
                    entry={top3[1]} 
                    position={2}
                    isCurrentUser={top3[1].user_id === user.id}
                  />
                </div>
                
                {/* 1st Place */}
                <div className="order-1 md:order-2">
                  <PodiumCard 
                    entry={top3[0]} 
                    position={1}
                    isCurrentUser={top3[0].user_id === user.id}
                  />
                </div>
                
                {/* 3rd Place */}
                <div className="order-3">
                  <PodiumCard 
                    entry={top3[2]} 
                    position={3}
                    isCurrentUser={top3[2].user_id === user.id}
                  />
                </div>
              </div>
            )}

            {/* Rest of Rankings */}
            <Card className="border-0 shadow-md overflow-hidden pt-0">
              <div className="bg-slate-100 px-6 py-4 border-b">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  Classificação Completa
                </h2>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {ranking.map((entry) => {
                    const isCurrentUser = user.id === entry.user_id
                    const accuracy = entry.total_predictions > 0 
                      ? Math.round((entry.correct_predictions / entry.total_predictions) * 100) 
                      : 0

                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between px-6 py-4 ${
                          isCurrentUser ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Position */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            entry.rank === 1 
                              ? 'bg-amber-400 text-white' 
                              : entry.rank === 2 
                                ? 'bg-slate-400 text-white' 
                                : entry.rank === 3 
                                  ? 'bg-orange-400 text-white' 
                                  : 'bg-slate-100 text-slate-600'
                          }`}>
                            {entry.rank <= 3 ? (
                              entry.rank === 1 ? <Crown className="w-5 h-5" /> :
                              entry.rank === 2 ? <Medal className="w-5 h-5" /> :
                              <Award className="w-5 h-5" />
                            ) : (
                              entry.rank
                            )}
                          </div>

                          {/* User Info */}
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {entry.user_name}
                              {isCurrentUser && (
                                <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">
                                  Você
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" />
                                {entry.correct_predictions}/{entry.total_predictions} acertos
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {accuracy}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isCurrentUser ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {entry.total_points}
                          </p>
                          <p className="text-xs text-slate-500">pontos</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

interface PodiumCardProps {
  entry: {
    user_id: number
    user_name: string
    correct_predictions: number
    total_predictions: number
    total_points: number
    rank: number
  }
  position: 1 | 2 | 3
  isCurrentUser: boolean
}

function PodiumCard({ entry, position, isCurrentUser }: PodiumCardProps) {
  const accuracy = entry.total_predictions > 0 
    ? Math.round((entry.correct_predictions / entry.total_predictions) * 100) 
    : 0

  const config = {
    1: {
      gradient: 'from-amber-400 to-yellow-500',
      icon: Crown,
      height: 'md:mt-0',
      label: '1º Lugar',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    2: {
      gradient: 'from-slate-400 to-slate-500',
      icon: Medal,
      height: 'md:mt-8',
      label: '2º Lugar',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    3: {
      gradient: 'from-orange-400 to-orange-500',
      icon: Award,
      height: 'md:mt-12',
      label: '3º Lugar',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  }

  const { gradient, icon: Icon, height, label, iconBg, iconColor } = config[position]

  return (
    <Card className={`border-0 shadow-lg overflow-hidden ${height} ${isCurrentUser ? 'ring-2 ring-emerald-500' : ''}`}>
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        
        <Badge className={`mb-3 bg-gradient-to-r ${gradient} text-white border-0`}>
          {label}
        </Badge>
        
        <h3 className="font-bold text-lg text-slate-900 mb-1">
          {entry.user_name}
          {isCurrentUser && <span className="text-emerald-600 text-sm ml-1">(você)</span>}
        </h3>
        
        <p className="text-3xl font-bold text-slate-900 mb-2">
          {entry.total_points}
          <span className="text-sm font-normal text-slate-500 ml-1">pts</span>
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>{entry.correct_predictions} acertos</span>
          <span>{accuracy}% precisão</span>
        </div>
      </CardContent>
    </Card>
  )
}
