import { requireUserWithLocation } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllVisibleTournaments, getActiveTournament, getGlobalRanking } from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TournamentCard } from '@/components/dashboard/tournament-card';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Trophy, SearchX } from 'lucide-react';
import { TournamentFilters } from '@/components/dashboard/tournament-filters';
import { TournamentPagination } from '@/components/dashboard/tournament-pagination';
import { RankingSection } from '@/components/dashboard/ranking-section';

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
  const user = await requireUserWithLocation();
  if (user.is_admin) redirect('/admin');

  const { status, search, category, page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;

  const [allTournaments, activeTournament, ranking] = await Promise.all([
    getAllVisibleTournaments(),
    getActiveTournament(),
    getGlobalRanking(5),
  ]);
  const activeStatuses = ['active', 'published', 'OPEN', 'LOCKED', 'IN_PROGRESS'];
  // Apply filters
  let filteredTournaments = allTournaments;
  if (status === 'finished') {
    filteredTournaments = filteredTournaments
      .filter((t) => ['finished', 'FINISHED', 'completed'].includes(t.status))
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  } else if (status === 'upcoming') {
    filteredTournaments = filteredTournaments
      .filter((t) => ['upcoming', 'UPCOMING', 'STANDBY'].includes(t.status))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  } else {
    filteredTournaments = filteredTournaments
      .filter((t) => activeStatuses.includes(t.status))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredTournaments = filteredTournaments.filter(
      (t) => t.name.toLowerCase().includes(searchLower) || t.location.toLowerCase().includes(searchLower),
    );
  }

  if (category && category !== 'all') {
    filteredTournaments = filteredTournaments.filter((t) => t.category === category);
  }

  const totalItems = filteredTournaments.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTournaments = filteredTournaments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const availableCount = allTournaments.filter((t) =>
    ['active', 'published', 'OPEN', 'UPCOMING', 'LOCKED', 'IN_PROGRESS'].includes(t.status),
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title="Torneios" subtitle="Participe dos maiores torneios do tênis mundial">
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Disponíveis</p>
                <p className="text-2xl font-black text-white">{availableCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-12 lg:px-32 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <TournamentFilters />

            {paginatedTournaments.length > 0 ? (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {status === 'finished'
                      ? 'Torneios Finalizados'
                      : status === 'active' || !status 
                        ? 'Torneios Ativos'
                        : 'Torneios Futuros'}
                  </h2>
                  <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                    {totalItems} {totalItems === 1 ? 'torneio' : 'torneios'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  {paginatedTournaments.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>

                <TournamentPagination currentPage={currentPage} totalPages={totalPages} />
              </section>
            ) : (
              <Card className="border-0 shadow-md rounded-[2rem]">
                <CardContent className="py-20 text-center">
                  <SearchX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum torneio encontrado</h2>
                  <p className="text-slate-600 mb-6">Não encontramos torneios que correspondam aos filtros selecionados.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <RankingSection ranking={ranking} currentUserId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

