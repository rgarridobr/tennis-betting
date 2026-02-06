import { getTournaments } from '@/lib/data'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Settings, Trophy, Zap, Calendar } from 'lucide-react'
import { TournamentStatusSelect } from '@/components/admin/tournament-status-select'

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments()

  const activeTournaments = tournaments.filter(t => t.status === 'active')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const completedTournaments = tournaments.filter(t => t.status === 'completed')

  const statusLabels: Record<string, string> = {
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
  }

  const surfaceEmojis: Record<string, string> = {
    Hard: 'Quadra Dura',
    Clay: 'Saibro',
    Grass: 'Grama',
  }

  return (
    <>
      <PageHero
        title="Gerenciar Torneios"
        subtitle="Crie e gerencie os Grand Slams do bolao"
      >
        <div className="flex items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Ativos</p>
                <p className="text-xl font-bold text-white">{activeTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Proximos</p>
                <p className="text-xl font-bold text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Button asChild className="bg-white text-emerald-700 hover:bg-white/90 font-semibold h-12 px-6">
            <Link href="/admin/torneios/novo">
              <Plus className="w-5 h-5 mr-2" />
              Novo Torneio
            </Link>
          </Button>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 py-8">
        {tournaments.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum torneio cadastrado</h2>
              <p className="text-slate-500 mb-6">Crie seu primeiro Grand Slam para comecar!</p>
              <Button asChild size="lg">
                <Link href="/admin/torneios/novo">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Torneio
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {[
              { title: 'Ativos', list: activeTournaments },
              { title: 'Proximos', list: upcomingTournaments },
              { title: 'Finalizados', list: completedTournaments },
            ]
              .filter(group => group.list.length > 0)
              .map(group => (
                <section key={group.title}>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">{group.title}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.list.map(tournament => (
                      <Card key={tournament.id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-2 ${tournament.status === 'active' ? 'bg-emerald-500' : tournament.status === 'upcoming' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{tournament.name}</h3>
                              <p className="text-sm text-slate-500 mt-1">{tournament.location}</p>
                            </div>
                            <Badge className={statusColors[tournament.status] || 'bg-slate-100 text-slate-600'}>
                              {statusLabels[tournament.status] || tournament.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <span>{surfaceEmojis[tournament.surface] || tournament.surface}</span>
                            <span>128 jogadores</span>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                            <TournamentStatusSelect
                              tournamentId={tournament.id}
                              currentStatus={tournament.status}
                            />
                            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                              <Link href={`/admin/torneios/${tournament.id}`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Gerenciar
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </main>
    </>
  )
}
