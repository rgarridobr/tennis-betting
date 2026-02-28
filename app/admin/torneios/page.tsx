import { getTournaments } from '@/lib/data';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Settings, Trophy, Zap, Calendar, ClipboardList, MapPin } from 'lucide-react';
import { DeleteTournamentButton } from '@/components/admin/delete-tournament-button';

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments();

  const standbyTournaments = tournaments.filter((t) => t.status === 'STANDBY' || t.status === 'draft');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'UPCOMING' || t.status === 'upcoming');
  const openTournaments = tournaments.filter((t) => t.status === 'OPEN' || t.status === 'active' || t.status === 'published');
  const inProgressTournaments = tournaments.filter((t) => t.status === 'LOCKED' || t.status === 'IN_PROGRESS');
  const completedTournaments = tournaments.filter((t) => t.status === 'FINISHED' || t.status === 'finished' || t.status === 'completed');

  const statusLabels: Record<string, string> = {
    STANDBY: 'Standby (Interno)',
    draft: 'Rascunho',
    UPCOMING: 'Em breve (Visível)',
    upcoming: 'Em breve',
    OPEN: 'Apostas Abertas',
    active: 'Ativo',
    published: 'Ativo',
    LOCKED: 'Apostas Fechadas',
    IN_PROGRESS: 'Em Andamento',
    FINISHED: 'Finalizado',
    finished: 'Finalizado',
    completed: 'Finalizado',
  };

  const statusColors: Record<string, string> = {
    STANDBY: 'bg-slate-100 text-slate-700',
    draft: 'bg-rose-100 text-rose-700',
    UPCOMING: 'bg-amber-100 text-amber-700',
    upcoming: 'bg-amber-100 text-amber-700',
    OPEN: 'bg-emerald-100 text-emerald-700',
    active: 'bg-emerald-100 text-emerald-700',
    published: 'bg-emerald-100 text-emerald-700',
    LOCKED: 'bg-orange-100 text-orange-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    FINISHED: 'bg-slate-100 text-slate-600',
    finished: 'bg-slate-100 text-slate-600',
    completed: 'bg-slate-100 text-slate-600',
  };

  const surfaceEmojis: Record<string, string> = {
    Hard: 'Quadra Dura',
    Clay: 'Saibro',
    Grass: 'Grama',
  };

  return (
    <>
      <PageHero title="Gerenciar Torneios" subtitle="Crie, edite e acompanhe seus campeonatos para o bolão de tênis">
        <div className="flex flex-wrap items-center gap-4 md:grid md:grid-cols-2 lg:flex">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl shrink-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-500/20 flex items-center justify-center border border-slate-500/30">
                <ClipboardList className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Standby</p>
                <p className="text-2xl font-black text-white">{standbyTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl shrink-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Abertos</p>
                <p className="text-2xl font-black text-white">{openTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl shrink-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Em breve</p>
                <p className="text-2xl font-black text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lista de Torneios</h2>
            <p className="text-slate-500 font-medium">Acompanhe e edite seus campeonatos</p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-black rounded-2xl px-8 shadow-lg shadow-emerald-200"
          >
            <Link href="/admin/torneios/novo">
              <Plus className="w-5 h-5 mr-2" />
              Novo Torneio
            </Link>
          </Button>
        </div>

        {tournaments.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum torneio cadastrado</h2>
              <p className="text-slate-500 mb-6">Crie seu primeiro Grand Slam para começar!</p>
              <Button asChild size="lg">
                <Link href="/admin/torneios/novo">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Torneio
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {[
              {
                title: 'Calendário (Standby)',
                list: standbyTournaments,
                icon: ClipboardList,
                color: 'text-slate-500',
              },
              { title: 'Próximos (Visíveis)', list: upcomingTournaments, icon: Calendar, color: 'text-amber-500' },
              { title: 'Abertos para Apostas', list: openTournaments, icon: Zap, color: 'text-emerald-500' },
              { title: 'Em Andamento / Bloqueados', list: inProgressTournaments, icon: Zap, color: 'text-blue-500' },
              { title: 'Finalizados', list: completedTournaments, icon: Trophy, color: 'text-slate-400' },
            ]
              .filter((group) => group.list.length > 0)
              .map((group) => (
                <section key={group.title}>
                  <div className="flex items-center gap-3 mb-6">
                    <group.icon className={`w-6 h-6 ${group.color}`} />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{group.title}</h2>
                    <Badge variant="outline" className="ml-2 font-bold">
                      {group.list.length}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.list.map((tournament) => (
                      <Card
                        key={tournament.id}
                        className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all rounded-[2.5rem] bg-white group"
                      >
                        <div
                          className={`h-3 ${
                            tournament.status === 'STANDBY' || tournament.status === 'draft'
                              ? 'bg-slate-400'
                              : tournament.status === 'OPEN' || tournament.status === 'active' || tournament.status === 'published'
                                ? 'bg-emerald-500'
                                : tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                                  ? 'bg-amber-400'
                                  : tournament.status === 'LOCKED' || tournament.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500'
                                    : 'bg-slate-300'
                          }`}
                        />
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-tight">
                                {tournament.name}
                              </h3>
                              <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {tournament.location}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${statusColors[tournament.status] || 'bg-slate-100 text-slate-600'} border-none font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full`}>
                                {statusLabels[tournament.status] || tournament.status}
                              </Badge>
                              {(tournament.status === 'STANDBY' || tournament.status === 'draft' || tournament.status === 'UPCOMING' || tournament.status === 'upcoming') && (
                                <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500 mb-8">
                            <span className="px-4 py-1.5 bg-slate-100 rounded-full">
                              {surfaceEmojis[tournament.surface] || tournament.surface}
                            </span>
                            <span className="px-4 py-1.5 bg-slate-100 rounded-full">{tournament.size} jogadores</span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="lg"
                              asChild
                              className="flex-1 rounded-2xl font-black border-2 hover:bg-slate-50 transition-colors"
                            >
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
