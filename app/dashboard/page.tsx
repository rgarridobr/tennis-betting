import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserStats, getAllVisibleTournaments, getActiveTournament, getGlobalRanking } from '@/lib/data';
import { HeroSection } from '@/components/dashboard/hero-section';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TournamentCard } from '@/components/dashboard/tournament-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RankingSection } from '@/components/dashboard/ranking-section';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.is_admin) redirect('/admin');



  const [tournaments, stats, ranking, activeTournament] = await Promise.all([
    getAllVisibleTournaments(4),
    getUserStats(user.id),
    getGlobalRanking(5),
    getActiveTournament(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />
      <HeroSection user={user} />

      <main className="container mx-auto px-4 md:px-12 lg:px-32 pb-12">
        <StatsCards stats={stats} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-12">
            {tournaments.length > 0 && (
              <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios Disponíveis</h2>
                </div>
                <p className="text-slate-500 text-lg font-medium">
                  Alguns torneios estão acontecendo agora. Participe e mostre suas habilidades!
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl px-6"
                asChild
              >
                <Link href="/torneios" className="flex items-center gap-2">
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
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
