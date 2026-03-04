import { getTournaments } from '@/lib/data';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Settings, Trophy, Zap, Calendar, ClipboardList, MapPin, ChevronRight } from 'lucide-react';
import { DeleteTournamentButton } from '@/components/admin/delete-tournament-button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  searchParams: Promise<{ month?: string }>;
}

// Helper to safely parse dates regardless if they are strings or Date objects
const parseDate = (date: string | Date) => {
  if (date instanceof Date) return date;
  return new Date(date);
};

export default async function AdminTournamentsPage({ searchParams }: Props) {
  const { month: selectedMonth } = await searchParams;
  const allTournaments = await getTournaments();

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const monthToFilter = selectedMonth !== undefined ? parseInt(selectedMonth) : currentMonthIndex;

  // Filter out tournaments from previous years if that's what's intended
  // "5 - apenas do ano atual, os dos anos anteriores nao precisam ser listados"
  const tournaments = allTournaments.filter((t) => parseDate(t.start_date).getFullYear() === currentYear);

  // Group tournaments by month for the sidebar
  const monthsWithEvents = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i;
    const count = tournaments.filter((t) => {
      const date = parseDate(t.start_date);
      return date.getFullYear() === currentYear && date.getMonth() === monthIndex;
    }).length;

    return {
      index: monthIndex,
      name: format(new Date(currentYear, monthIndex), 'MMMM', { locale: ptBR }),
      count,
    };
  }).filter((m) => m.count > 0);

  const filteredTournaments = tournaments.filter((t) => {
    const date = parseDate(t.start_date);
    return date.getFullYear() === currentYear && date.getMonth() === monthToFilter;
  });

  const standbyTournaments = filteredTournaments.filter((t) => t.status === 'STANDBY' || t.status === 'draft');
  const upcomingTournaments = filteredTournaments.filter((t) => t.status === 'UPCOMING' || t.status === 'upcoming');
  const openTournaments = filteredTournaments.filter(
    (t) => t.status === 'OPEN' || t.status === 'active' || t.status === 'published',
  );
  const inProgressTournaments = filteredTournaments.filter((t) => t.status === 'LOCKED' || t.status === 'IN_PROGRESS');
  const completedTournaments = filteredTournaments.filter(
    (t) => t.status === 'FINISHED' || t.status === 'finished' || t.status === 'completed',
  );

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
      <PageHero title="Gerenciar Torneios" subtitle="Crie, edite e acompanhe seus campeonatos para o bolão de tênis"/>
 
 
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Filtrar por Mês
              </h3>
              <div className="flex flex-col gap-2">
                {monthsWithEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 font-medium italic">Nenhum torneio este ano.</p>
                ) : (
                  <>
                    {monthsWithEvents.map((m) => {
                      const isSelected = monthToFilter === m.index;
                      return (
                        <Link
                          key={m.index}
                          href={isSelected ? '/admin/torneios' : `/admin/torneios?month=${m.index}`}
                          scroll={false}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-2xl transition-all group border-2',
                            isSelected
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-md'
                              : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-600',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                isSelected ? 'bg-emerald-500' : 'bg-slate-300 group-hover:bg-slate-400',
                              )}
                            />
                            <span
                              className={cn('font-bold capitalize', isSelected ? 'text-emerald-900' : 'text-slate-600')}
                            >
                              {m.name}, {currentYear}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isSelected ? 'default' : 'secondary'}
                              className={cn(
                                'rounded-lg font-black',
                                isSelected ? 'bg-emerald-500' : 'bg-slate-100 text-slate-500',
                              )}
                            >
                              {m.count} {m.count === 1 ? 'evento' : 'eventos'}
                            </Badge>
                            <ChevronRight
                              className={cn(
                                'w-4 h-4 transition-transform',
                                isSelected ? 'rotate-90 text-emerald-500' : 'text-slate-300 group-hover:translate-x-1',
                              )}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Tournament List */}
          <div className="lg:col-span-3">
            {filteredTournaments.length === 0 ? (
              <Card className="border-0 shadow-md rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200">
                <CardContent className="py-20 text-center">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum torneio neste mês</h2>
                  <p className="text-slate-500 mb-8">Tente outro mês ou crie um novo torneio para começar!</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild size="lg" className="rounded-2xl font-black">
                      <Link href="/admin/torneios">Ver Todos</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-black rounded-2xl px-8"
                    >
                      <Link href="/admin/torneios/novo">
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Torneio
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-12">
                {[
                  { title: 'Abertos para Apostas', list: openTournaments, icon: Zap, color: 'text-emerald-500' },

                  {
                    title: 'Calendário (Standby)',
                    list: standbyTournaments,
                    icon: ClipboardList,
                    color: 'text-slate-500',
                  },
                  { title: 'Próximos (Visíveis)', list: upcomingTournaments, icon: Calendar, color: 'text-amber-500' },
                  {
                    title: 'Em Andamento / Bloqueados',
                    list: inProgressTournaments,
                    icon: Zap,
                    color: 'text-blue-500',
                  },
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
                      <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-6">
                        {group.list.map((tournament) => (
                          <Card
                            key={tournament.id}
                            className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all rounded-[2.5rem] bg-white group"
                          >
                            <div
                              className={`h-3 ${
                                tournament.status === 'STANDBY' || tournament.status === 'draft'
                                  ? 'bg-slate-400'
                                  : tournament.status === 'OPEN' ||
                                      tournament.status === 'active' ||
                                      tournament.status === 'published'
                                    ? 'bg-emerald-500'
                                    : tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                                      ? 'bg-amber-400'
                                      : tournament.status === 'LOCKED' || tournament.status === 'IN_PROGRESS'
                                        ? 'bg-blue-500'
                                        : 'bg-slate-300'
                              }`}
                            />
                            <CardContent className="p-8">
                              <div className="flex items-start justify-between mb-4 gap-4">
                                <div className="min-w-0">
                                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-tight truncate">
                                    {tournament.name}
                                  </h3>
                                  <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {tournament.location}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <Badge
                                    className={`${statusColors[tournament.status] || 'bg-slate-100 text-slate-600'} border-none font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full whitespace-nowrap`}
                                  >
                                    {statusLabels[tournament.status] || tournament.status}
                                  </Badge>
                                  {(tournament.status === 'STANDBY' ||
                                    tournament.status === 'draft' ||
                                    tournament.status === 'UPCOMING' ||
                                    tournament.status === 'upcoming') && (
                                    <DeleteTournamentButton
                                      tournamentId={tournament.id}
                                      tournamentName={tournament.name}
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500 mb-8">
                                <span className="px-4 py-1.5 bg-slate-100 rounded-full">
                                  {surfaceEmojis[tournament.surface] || tournament.surface}
                                </span>
                                <span className="px-4 py-1.5 bg-slate-100 rounded-full">
                                  {tournament.size} jogadores
                                </span>
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(parseDate(tournament.start_date), "dd 'de' MMM", { locale: ptBR })}
                                </span>
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
          </div>
        </div>
      </main>
    </>
  );
}
