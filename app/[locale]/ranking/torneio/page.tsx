import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllVisibleTournaments, getActiveTournament } from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TournamentRankingCard } from '@/components/dashboard/tournament-ranking-card';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { SearchX, Award } from 'lucide-react';
import { TournamentFilters } from '@/components/dashboard/tournament-filters';
import { TournamentPagination } from '@/components/dashboard/tournament-pagination';
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

export default async function TournamentRankingListPage({ searchParams }: PageProps) {
  const user = await getSession();
  if (user?.is_admin) redirect('/admin');

  const t = await getTranslations('ranking');
  const tCommon = await getTranslations('common');

  const { status, search, category, page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const [allTournaments, activeTournament] = await Promise.all([
    getAllVisibleTournaments(undefined, true),
    getActiveTournament(),
  ]);

  // Filter out upcoming tournaments (only active or finished allowed for rankings)
  const allowedStatuses = [
    'active', 'published', 'OPEN', 'LOCKED', 'IN_PROGRESS',
    'finished', 'FINISHED', 'completed'
  ];

  let filteredTournaments = allTournaments.filter(tItem => allowedStatuses.includes(tItem.status));

  // Apply filters from searchParams
  if (status === 'active' || !status) {
    const activeStatuses = ['active', 'published', 'OPEN', 'LOCKED', 'IN_PROGRESS'];
    filteredTournaments = filteredTournaments.filter((tItem) => activeStatuses.includes(tItem.status));
  } else if (status === 'finished') {
    const finishedStatuses = ['finished', 'FINISHED', 'completed'];
    filteredTournaments = filteredTournaments.filter((tItem) => finishedStatuses.includes(tItem.status));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredTournaments = filteredTournaments.filter(
      (tItem) => tItem.name.toLowerCase().includes(searchLower) || tItem.location.toLowerCase().includes(searchLower),
    );
  }

  if (category && category !== 'all') {
    filteredTournaments = filteredTournaments.filter((tItem) => tItem.category === category);
  }

  filteredTournaments = filteredTournaments.sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  );

  const totalItems = filteredTournaments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTournaments = filteredTournaments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title={t('byTournamentTitle')} subtitle={t('byTournamentSubtitle')}>
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-100/70 text-xs font-bold uppercase tracking-wider">{t('total')}</p>
                <p className="text-2xl font-black text-white">{filteredTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-12">
        <TournamentFilters hideUpcoming={true} />

        {paginatedTournaments.length > 0 ? (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {status === 'finished' ? t('finished') : t('active')}
              </h2>
              <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                {totalItems} {totalItems === 1 ? tCommon('tournamentOne') : tCommon('tournamentOther')}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedTournaments.map((tItem) => (
                <TournamentRankingCard
                  key={tItem.id}
                  tournament={tItem}
                  href={`/ranking/torneio/${tItem.id}`}
                />
              ))}
            </div>

            <TournamentPagination currentPage={currentPage} totalPages={totalPages} />
          </section>
        ) : (
          <Card className="border-0 shadow-md rounded-[2rem]">
            <CardContent className="py-20 text-center">
              <SearchX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('notFoundTitle')}</h2>
              <p className="text-slate-600 mb-6">{t('notFoundBody')}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
