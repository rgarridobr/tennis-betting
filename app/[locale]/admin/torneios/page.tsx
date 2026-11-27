import { getTournaments, type Tournament } from '@/lib/data';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { Plus, Settings, Trophy, Zap, Calendar, ClipboardList, MapPin, ChevronRight } from 'lucide-react';
import { DeleteTournamentButton } from '@/components/admin/delete-tournament-button';
import { TournamentVisibilityToggle } from '@/components/admin/tournament-visibility-toggle';
import { TournamentYearSelect } from '@/components/admin/tournament-year-select';
import { cn, getStatusLabelKeys } from '@/lib/utils'
import { normalizeSurfaceKey } from '@/lib/tournament';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { getLocale, getTranslations } from 'next-intl/server';

const FIRST_CALENDAR_YEAR = 2026;

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

// Helper to safely parse dates regardless if they are strings or Date objects
const parseDate = (date: string | Date) => {
  if (date instanceof Date) return date;
  return new Date(date);
};

export default async function AdminTournamentsPage({ searchParams }: Props) {
  const { year: selectedYear, month: selectedMonth } = await searchParams;
  const allTournaments = await getTournaments();
  const t = await getTranslations('admin');
  const tStatus = await getTranslations('status');
  const tSurfaces = await getTranslations('surfaces');
  const tButtons = await getTranslations('buttons');
  const locale = await getLocale();
  const dateLocale = locale === 'en' ? enUS : ptBR;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const calendar = allTournaments.map((tournament) => ({
    tournament,
    date: parseDate(tournament.start_date),
  }));
  const lastYear = calendar.reduce((latest, { date }) => Math.max(latest, date.getFullYear()), currentYear);
  const years = Array.from({ length: lastYear - FIRST_CALENDAR_YEAR + 1 }, (_, index) => FIRST_CALENDAR_YEAR + index);
  const year = years.find((option) => String(option) === selectedYear) ?? currentYear;
  const tournamentsByMonth = new Map<number, Tournament[]>();

  for (const { tournament, date } of calendar) {
    if (date.getFullYear() !== year) continue;

    const month = date.getMonth();
    const tournaments = tournamentsByMonth.get(month);
    if (tournaments) tournaments.push(tournament);
    else tournamentsByMonth.set(month, [tournament]);
  }

  const monthsWithEvents = Array.from(tournamentsByMonth, ([month, tournaments]) => ({
    month,
    label: format(new Date(year, month), 'MMMM', { locale: dateLocale }),
    count: tournaments.length,
    href: { pathname: '/admin/torneios', query: { year, month } },
  }));

  const requestedMonth = monthsWithEvents.find(({ month }) => String(month) === selectedMonth)?.month;
  const defaultMonth = year === currentYear ? currentMonth : monthsWithEvents[0]?.month;
  const monthToFilter = requestedMonth ?? defaultMonth;
  const filteredTournaments = monthToFilter === undefined ? [] : tournamentsByMonth.get(monthToFilter) ?? [];

  const standbyTournaments = filteredTournaments.filter((tournament) => tournament.status === 'STANDBY' || tournament.status === 'draft');
  const upcomingTournaments = filteredTournaments.filter((tournament) => tournament.status === 'UPCOMING' || tournament.status === 'upcoming');
  const openTournaments = filteredTournaments.filter(
    (tournament) => tournament.status === 'OPEN' || tournament.status === 'active' || tournament.status === 'published',
  );
  const inProgressTournaments = filteredTournaments.filter((tournament) => tournament.status === 'LOCKED' || tournament.status === 'IN_PROGRESS');
  const completedTournaments = filteredTournaments.filter(
    (tournament) => tournament.status === 'FINISHED' || tournament.status === 'finished' || tournament.status === 'completed',
  );

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

  return (
    <>
      <PageHero title={t('tournamentsTitle')} subtitle={t('tournamentsSubtitle')} />

      <main className="container mx-auto px-4 md:px-32 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('tournamentsListTitle')}</h2>
            <p className="text-slate-500 font-medium">{t('tournamentsListSubtitle')}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 h-12 sm:h-14"
          >
            <Link href="/admin/torneios/novo">
              <Plus className="w-5 h-5 mr-2" />
              {t('newTournament')}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="min-w-0 space-y-6 lg:col-span-1">
            <TournamentYearSelect year={year} years={years} />

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-900 lg:mb-6 lg:text-xl">
                <Calendar className="size-5 text-emerald-600" />
                {t('filterByMonth')}
              </h3>

              {monthsWithEvents.length === 0 ? (
                <p className="text-sm font-medium italic text-slate-500">
                  {t('noCalendarTournaments', { year: String(year) })}
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                  {monthsWithEvents.map(({ month, label, count, href }) => {
                    const isSelected = monthToFilter === month;

                    return (
                      <Link
                        key={month}
                        href={href}
                        aria-current={isSelected ? 'true' : undefined}
                        scroll={false}
                        className={cn(
                          'group flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition-all lg:shrink lg:whitespace-normal lg:rounded-2xl lg:p-4',
                          isSelected
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-md'
                            : 'border-transparent bg-white text-slate-600 hover:border-slate-100 hover:bg-slate-50',
                        )}
                      >
                        <span className="flex items-center gap-3 capitalize">
                          <span className={cn('hidden size-2 shrink-0 rounded-full lg:block', isSelected ? 'bg-emerald-500' : 'bg-slate-300')} />
                          {label}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={isSelected ? 'default' : 'secondary'}
                            className={cn('rounded-lg font-black', isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600')}
                          >
                            {count}
                            <span className="hidden lg:inline">{count === 1 ? t('eventOne') : t('eventOther')}</span>
                          </Badge>
                          <ChevronRight
                            className={cn(
                              'hidden size-4 transition-transform lg:block',
                              isSelected ? 'rotate-90 text-emerald-500' : 'text-slate-400 group-hover:translate-x-1',
                            )}
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Tournament List */}
          <div className="lg:col-span-3">
            {filteredTournaments.length === 0 ? (
              <Card className="border-0 shadow-md rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200">
                <CardContent className="py-20 text-center">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('emptyMonthTitle')}</h2>
                  <p className="text-slate-500 mb-8">{t('emptyMonthBody')}</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-black rounded-2xl px-8"
                    >
                      <Link href="/admin/torneios/novo">
                        <Plus className="w-5 h-5 mr-2" />
                        {t('newTournament')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-12">
                {[
                  {
                    title: t('groupInProgress'),
                    list: inProgressTournaments,
                    icon: Zap,
                    color: 'text-blue-500',
                  },
                  { title: t('groupOpen'), list: openTournaments, icon: Zap, color: 'text-emerald-500' },
                  { title: t('groupUpcoming'), list: upcomingTournaments, icon: Calendar, color: 'text-amber-500' },

                  {
                    title: t('groupStandby'),
                    list: standbyTournaments,
                    icon: ClipboardList,
                    color: 'text-slate-500',
                  },
                  { title: t('groupFinished'), list: completedTournaments, icon: Trophy, color: 'text-slate-400' },
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
                      <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                        {group.list.map((tournament) => {
                          const surfaceKey = normalizeSurfaceKey(tournament.surface);
                          const surfaceLabel =
                            surfaceKey === 'Hard' || surfaceKey === 'Clay' || surfaceKey === 'Grass'
                              ? tSurfaces(surfaceKey)
                              : tournament.surface;

                          return (
                          <Card
                            key={tournament.id}
                            className="flex flex-col border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all rounded-[2.5rem] bg-white group h-full"
                          >
                            <div
                              className={`h-3 shrink-0 ${
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
                            <CardContent className="p-8 flex flex-col h-full">
                              {/* Line 1: Nome do Torneio */}
                              <div className="mb-2">
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-tight line-clamp-2 min-h-[3.5rem]">
                                  {tournament.name}
                                </h3>
                              </div>

                              {/* Line 2: Cidade, País */}
                              <div className="mb-4">
                                <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {tournament.location}
                                </p>
                              </div>

                              {/* Line 3: Botão de visibilidade e status */}
                              <div className="flex items-center gap-2 mb-6">
                                <TournamentVisibilityToggle
                                  tournamentId={tournament.id}
                                  isVisible={tournament.is_visible}
                                />
                                <Badge
                                  className={`${statusColors[tournament.status] || 'bg-slate-100 text-slate-600'} border-none font-black uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap`}
                                >
                                  {tStatus(getStatusLabelKeys[tournament.status] || 'active')}
                                </Badge>
                              </div>

                              {/* Line 4: Piso, jogadores e data */}
                              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500 mb-8">
                                <span className="px-4 py-1.5 bg-slate-100 rounded-full text-slate-600">
                                  {surfaceLabel}
                                </span>
                                <span className="px-4 py-1.5 bg-slate-100 rounded-full text-slate-600">
                                  {t('playerCount', { n: tournament.size })}
                                </span>
                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(parseDate(tournament.start_date), locale === 'en' ? 'MMM dd' : "dd 'de' MMM", { locale: dateLocale })}
                                </span>
                              </div>

                              {/* Line 5: GERENCIAR + Lixeira */}
                              <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-100">
                                <Button
                                  variant="outline"
                                  size="lg"
                                  asChild
                                  className="flex-1 rounded-2xl font-black border-2 hover:bg-slate-50 transition-colors h-14"
                                >
                                  <Link href={`/admin/torneios/${tournament.id}`}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    {tButtons('manage')}
                                  </Link>
                                </Button>
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
                            </CardContent>
                          </Card>
                          );
                        })}
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
