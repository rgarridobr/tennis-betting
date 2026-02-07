import { getTournaments } from '@/lib/data';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Settings, Trophy, Zap, Calendar } from 'lucide-react';
import { TournamentStatusSelect } from '@/components/admin/tournament-status-select';

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments();

  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');
  const completedTournaments = tournaments.filter((t) => t.status === 'completed');

  const statusLabels: Record<string, string> = {
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  };

  const statusColors: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
  };

  const surfaceEmojis: Record<string, string> = {
    Hard: 'Quadra Dura',
    Clay: 'Saibro',
    Grass: 'Grama',
  };

  return (
    <>
      <PageHero title="Gerenciar Torneios" subtitle="Crie e gerencie os Grand Slams do bolão">
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Ativos</p>
                <p className="text-2xl font-black text-white">{activeTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Próximos</p>
                <p className="text-2xl font-black text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          {tournaments.length > 0 && (
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-white/90 font-black rounded-2xl px-8">
              <Link href="/admin/torneios/novo">
                <Plus className="w-5 h-5 mr-2" />
                Novo Torneio
              </Link>
            </Button>
          )}
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
              { title: 'Próximos', list: upcomingTournaments },
              { title: 'Finalizados', list: completedTournaments },
            ]
              .filter((group) => group.list.length > 0)
              .map((group) => (
                <section key={group.title}>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">{group.title}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.list.map((tournament) => (
                      <Card
                        key={tournament.id}
                        className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all rounded-[2rem] bg-white group"
                      >
                        <div
                          className={`h-3 ${tournament.status === 'active' ? 'bg-emerald-500' : tournament.status === 'upcoming' ? 'bg-amber-400' : 'bg-slate-300'}`}
                        />
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-black text-slate-900 text-xl tracking-tight">{tournament.name}</h3>
                              <p className="text-sm font-semibold text-slate-400 mt-1">{tournament.location}</p>
                            </div>
                            <Badge className={`${statusColors[tournament.status] || 'bg-slate-100 text-slate-600'} border-none font-bold uppercase text-[10px] tracking-wider px-3`}>
                              {statusLabels[tournament.status] || tournament.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-6">
                            <span className="px-3 py-1 bg-slate-100 rounded-full">{surfaceEmojis[tournament.surface] || tournament.surface}</span>
                            <span className="px-3 py-1 bg-slate-100 rounded-full">128 jogadores</span>
                          </div>

                          <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                            <TournamentStatusSelect tournamentId={tournament.id} currentStatus={tournament.status} />
                            <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl font-bold border-2">
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
  );
}
