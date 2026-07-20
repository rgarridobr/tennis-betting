import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getUserStats,
  getAllVisibleTournaments,
  getActiveTournament,
  getGlobalRanking,
} from '@/lib/data';
import { HeroSection } from '@/components/dashboard/hero-section';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { TournamentCard } from '@/components/dashboard/tournament-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RankingSection } from '@/components/dashboard/ranking-section';
import { ChevronRight, LockKeyhole, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export async function PublicDashboardPage() {
  const user = await getSession();
  if (user?.is_admin) redirect('/admin');

  const t = await getTranslations('dashboard');

  const [tournaments, stats, ranking, activeTournament] = await Promise.all([
    getAllVisibleTournaments(4),
    user
      ? getUserStats(user.id)
      : Promise.resolve({
          total_points: 0,
          correct_predictions: 0,
          wrong_predictions: 0,
          total_predictions: 0,
          accuracy: 0,
          active_tournaments: 0,
          tournament_stats: [],
        }),
    getGlobalRanking(5),
    getActiveTournament(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />
      <HeroSection user={user} />

      <main className="container mx-auto px-4 md:px-12 lg:px-32 pb-12">
        <div className="relative">
          <StatsCards stats={stats} />
          {!user && (
            <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
              <div className="absolute inset-x-0 top-2 bottom-2 rounded-[2rem] bg-slate-50/60 backdrop-blur-[3px]" />
              <div className="relative flex w-full max-w-xl flex-col items-center gap-3 rounded-[2rem] border border-emerald-100 bg-white/95 px-5 py-4 text-center shadow-[0_18px_50px_rgba(15,23,42,0.14)] sm:flex-row sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-900">
                    Estatisticas pessoais
                  </p>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                    Entre para visualizar seus pontos, acertos, precisao e torneios em andamento.
                  </p>
                </div>
                <Button
                  asChild
                  className="h-11 shrink-0 rounded-xl bg-emerald-600 px-5 font-black text-white shadow-lg shadow-emerald-100 hover:bg-emerald-500"
                >
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-12">
            {tournaments.length > 0 && (
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {t('availableTournaments')}
                      </h2>
                    </div>
                    <p className="text-slate-500 text-lg font-medium">
                      {t('availableSubtitle')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl px-6"
                    asChild
                  >
                    <Link href="/torneios" className="flex items-center gap-2">
                      {t('viewAll')}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  {tournaments.map((tItem) => (
                    <TournamentCard key={tItem.id} tournament={tItem} />
                  ))}
                </div>
              </section>
            )}

            {tournaments.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>{t('noTournaments')}</p>
              </div>
            )}
          </div>

          <div>
            <RankingSection ranking={ranking} currentUserId={user?.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
