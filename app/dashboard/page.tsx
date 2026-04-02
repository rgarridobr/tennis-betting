import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserStats, getAllVisibleTournaments, getActiveTournament, getGlobalRanking } from '@/lib/data';
import { HeroSection } from '@/components/dashboard/hero-section';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TournamentCard } from '@/components/dashboard/tournament-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RankingSection } from '@/components/dashboard/ranking-section';
import { DateBR } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.is_admin) redirect('/admin');

  const [tournaments, stats, ranking, activeTournament] = await Promise.all([
    getAllVisibleTournaments(),
    getUserStats(user.id),
    getGlobalRanking(5),
    getActiveTournament(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />
      <HeroSection user={user} />

      <main className="container mx-auto px-4 md:px-32 pb-12">
        <StatsCards stats={stats} />

        <div className="mt-12 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {tournaments.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios Disponíveis</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {tournaments.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              </section>
            )}

            {tournaments.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>Nenhum torneio disponivel no momento.</p>
              </div>
            )}
          </div>

          <div>
            <RankingSection ranking={ranking} currentUserId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
