import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments } from '@/lib/data'
import { getAthletes } from '@/lib/actions/bracket'
import { AdminHeader } from '@/components/admin/admin-header'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, ChevronRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { AthleteManager } from '@/components/admin/athlete-manager'

export default async function ChaveamentoPage() {
  const user = await getSession()
  if (!user) redirect('/login')
  if (!user.is_admin) redirect('/dashboard')

  const tournaments = await getTournaments()
  const athletes = await getAthletes()

  const activeTournaments = tournaments.filter(t => t.status === 'live' || t.status === 'upcoming')

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} />
      
      <PageHero 
        title="Gerenciar Chaveamento" 
        subtitle="Cadastre atletas e gerencie as chaves dos torneios"
      >
        <div className="flex items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-300" />
              <div>
                <p className="text-emerald-100 text-xs">Atletas</p>
                <p className="text-xl font-bold text-white">{athletes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-300" />
              <div>
                <p className="text-emerald-100 text-xs">Torneios Ativos</p>
                <p className="text-xl font-bold text-white">{activeTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Athletes Manager */}
          <AthleteManager athletes={athletes} />

          {/* Tournament Brackets */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  Chaveamentos por Torneio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTournaments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Nenhum torneio ativo. Crie um torneio primeiro.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeTournaments.map((tournament) => (
                      <Link 
                        key={tournament.id} 
                        href={`/admin/chaveamento/${tournament.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{tournament.name}</p>
                              <p className="text-sm text-slate-500">{tournament.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                              {tournament.status === 'live' ? 'Ao Vivo' : 'Em Breve'}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Tournaments */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" />
                  Todos os Torneios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tournaments.map((tournament) => (
                    <Link 
                      key={tournament.id} 
                      href={`/admin/chaveamento/${tournament.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-sm text-slate-700">{tournament.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {tournament.status === 'live' ? 'Ao Vivo' : 
                           tournament.status === 'upcoming' ? 'Em Breve' : 'Finalizado'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
