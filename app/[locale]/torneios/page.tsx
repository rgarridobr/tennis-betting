import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SearchX, Trophy, Zap } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { getAllVisibleTournaments, getActiveTournament, getGlobalRanking } from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RankingSection } from '@/components/dashboard/ranking-section';
import { TournamentCard } from '@/components/dashboard/tournament-card';
import { TournamentFilters } from '@/components/dashboard/tournament-filters';
import { TournamentPagination } from '@/components/dashboard/tournament-pagination';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    category?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export default async function TournamentsPage({ searchParams }: PageProps) {
  const user = await getSession();
  if (user?.is_admin) redirect('/admin');

  const t = await getTranslations('tournaments');
  const tCommon = await getTranslations('common');

  const { status, search, category, page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  const [allTournaments, activeTournament, ranking] = await Promise.all([
    getAllVisibleTournaments(undefined, true),
    getActiveTournament(),
    getGlobalRanking(5),
  ]);

  const activeStatuses = ['active', 'published', 'OPEN', 'LOCKED', 'IN_PROGRESS'];
  const upcomingStatuses = ['upcoming', 'UPCOMING', 'STANDBY'];
  const finishedStatuses = ['finished', 'FINISHED', 'completed'];

  const hasActiveTournaments = allTournaments.some((tItem) => activeStatuses.includes(tItem.status));
  const defaultStatus = hasActiveTournaments ? 'active' : 'upcoming';
  const requestedStatus = status || defaultStatus;
  const explicitlyRequestedActive = status === 'active';
  const statusCounts = {
    active: allTournaments.filter((tItem) => activeStatuses.includes(tItem.status)).length,
    upcoming: allTournaments.filter((tItem) => upcomingStatuses.includes(tItem.status)).length,
    finished: allTournaments.filter((tItem) => finishedStatuses.includes(tItem.status)).length,
  };

  function applyTextAndCategoryFilters(tournaments: typeof allTournaments) {
    let result = tournaments;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tItem) => tItem.name.toLowerCase().includes(searchLower) || tItem.location.toLowerCase().includes(searchLower),
      );
    }

    if (category && category !== 'all') {
      result = result.filter((tItem) => tItem.category === category);
    }

    return result;
  }

  let filteredTournaments = allTournaments;
  let sectionTitle = t('sectionActive');
  let showNoActiveInfo = false;

  if (requestedStatus === 'finished') {
    filteredTournaments = filteredTournaments
      .filter((tItem) => finishedStatuses.includes(tItem.status))
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    sectionTitle = t('sectionFinished');
  } else if (requestedStatus === 'upcoming') {
    filteredTournaments = filteredTournaments
      .filter((tItem) => upcomingStatuses.includes(tItem.status))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    sectionTitle = t('sectionUpcoming');
  } else {
    filteredTournaments = filteredTournaments
      .filter((tItem) => activeStatuses.includes(tItem.status))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    showNoActiveInfo = explicitlyRequestedActive && !hasActiveTournaments;
  }

  filteredTournaments = applyTextAndCategoryFilters(filteredTournaments);

  const totalItems = filteredTournaments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTournaments = filteredTournaments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const availableCount = allTournaments.filter((tItem) =>
    [...activeStatuses, ...upcomingStatuses].includes(tItem.status),
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title={t('title')} subtitle={t('subtitle')}>
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">{t('available')}</p>
                <p className="text-2xl font-black text-white">{availableCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-12 lg:px-32 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <TournamentFilters defaultStatus={defaultStatus} statusCounts={statusCounts} />
            {showNoActiveInfo ? (
              <Card className="border border-emerald-100 bg-white shadow-md rounded-[2rem]">
                <CardContent className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        {t('noActiveTitle')}
                      </h2>
                      <p className="mt-2 text-slate-600 font-medium leading-relaxed">
                        {t('noActiveBody')}
                      </p>
                    </div>
                    <Button asChild className="rounded-2xl bg-emerald-600 font-black hover:bg-emerald-500">
                      <Link href="/torneios?status=upcoming">{t('viewUpcoming')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : paginatedTournaments.length > 0 ? (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{sectionTitle}</h2>
                  <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                    {totalItems} {totalItems === 1 ? tCommon('tournamentOne') : tCommon('tournamentOther')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  {paginatedTournaments.map((tItem) => (
                    <TournamentCard key={tItem.id} tournament={tItem} />
                  ))}
                </div>

                <TournamentPagination currentPage={currentPage} totalPages={totalPages} />
              </section>
            ) : (
              <Card className="border-0 shadow-md rounded-[2rem]">
                <CardContent className="py-20 text-center">
                  <SearchX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('notFoundTitle')}</h2>
                  <p className="text-slate-600 mb-6">
                    {t('notFoundBody')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <RankingSection ranking={ranking} currentUserId={user?.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
