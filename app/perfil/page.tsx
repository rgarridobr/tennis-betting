import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserStats, getGlobalRanking } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp,
  Medal,
  Award,
  Shield
} from 'lucide-react'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'

export default async function PerfilPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [stats, ranking] = await Promise.all([
    getUserStats(user.id),
    getGlobalRanking(100),
  ])

  // Find user position in ranking
  const userRankEntry = ranking.find(r => r.user_id === user.id)
  const userPosition = userRankEntry?.rank || '-'

  // Calculate account age
  const createdAt = new Date(user.created_at)
  const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      
      <PageHero title="Meu Perfil" subtitle="Gerencie suas informações e veja suas estatísticas">
        <Card className="bg-white/10 border-0 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user.name}</p>
              <p className="text-emerald-100 text-sm">{user.email}</p>
              {user.is_admin && (
                <Badge className="mt-1 bg-amber-500/80 text-white text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrador
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </PageHero>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Statistics */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total_points}</p>
                    <p className="text-xs text-slate-500">Pontos Totais</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                      <Medal className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userPosition}º</p>
                    <p className="text-xs text-slate-500">Posição Ranking</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total_predictions}</p>
                    <p className="text-xs text-slate-500">Palpites</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.accuracy}%</p>
                    <p className="text-xs text-slate-500">Precisão</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-emerald-700">Acertos</span>
                    <span className="font-bold text-emerald-700">{stats.correct_predictions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700">Erros</span>
                    <span className="font-bold text-red-700">
                      {stats.total_predictions - stats.correct_predictions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-emerald-600" />
                  Editar Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileEditForm user={user} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-emerald-600" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nome</p>
                    <p className="font-medium text-slate-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Membro desde</p>
                    <p className="font-medium text-slate-900">
                      {createdAt.toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tempo de conta</span>
                    <Badge variant="secondary">
                      {accountAge} {accountAge === 1 ? 'dia' : 'dias'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements placeholder */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.total_predictions >= 10 && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-emerald-900">Palpiteiro</p>
                        <p className="text-xs text-emerald-600">10+ palpites</p>
                      </div>
                    </div>
                  )}
                  
                  {stats.correct_predictions >= 5 && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-amber-900">Vidente</p>
                        <p className="text-xs text-amber-600">5+ acertos</p>
                      </div>
                    </div>
                  )}

                  {Number(stats.accuracy) >= 70 && stats.total_predictions >= 5 && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-purple-900">Expert</p>
                        <p className="text-xs text-purple-600">70%+ precisão</p>
                      </div>
                    </div>
                  )}

                  {stats.total_predictions === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Faça palpites para desbloquear conquistas!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
