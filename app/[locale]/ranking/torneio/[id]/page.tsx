import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import {
  getTournamentRanking,
  getTournamentById,
  hasTournamentStarted,
  getActiveTournament
} from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { TournamentRanking } from '@/components/tournament/tournament-ranking';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface TournamentRankingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TournamentRankingPage({ params, searchParams }: TournamentRankingPageProps) {
  const user = await getSession();
  if (user?.is_admin) redirect('/admin');

  const t = await getTranslations('ranking');

  const { id } = await params;
  const { tab = 'nacional' } = await searchParams;
  const tournamentId = parseInt(id, 10);
  if (isNaN(tournamentId)) notFound();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) notFound();

  const [ranking, started, activeTournament] = await Promise.all([
    tab === 'estadual' && user?.state
      ? getTournamentRanking(tournamentId, 100, user.state)
      : getTournamentRanking(tournamentId),
    hasTournamentStarted(tournamentId),
    getActiveTournament()
  ]);

  // Find current user's position in this tournament
  const userRankEntry = user ? ranking.find((r) => r.user_id === user.id) : undefined;
  const userPosition = userRankEntry?.rank || '-';
  const userPoints = userRankEntry?.total_points || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      {/* Header */}
      <PageHero
        title={t('tournamentTitle', { name: tournament.name })}
        subtitle={t('tournamentSubtitle')}
      >
        {user && (
        <Card className="bg-white/10 border-0 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{userPosition}º</span>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">{t('yourPosition')}</p>
              <p className="text-white font-semibold">
                {user.nickname ||
                  user.name.charAt(0).toUpperCase() +
                    user.name.slice(1).toLowerCase().split(' ')[0] +
                    (user.name.split(' ').length > 1
                      ? ' ' + user.name.split(' ')[1].charAt(0).toUpperCase() + '.'
                      : '')}
              </p>
              <p className="text-amber-300 font-bold">{t('pointsValue', { n: userPoints })}</p>
            </div>
          </CardContent>
        </Card>
        )}
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl max-w-[300px] mx-auto mb-8 ring-1 ring-slate-200/50">
          <Link
            href={`/ranking/torneio/${tournamentId}?tab=nacional`}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-sm transition-all ${
              tab === "nacional"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t('tabNational')}
          </Link>
          <Link
            href={`/ranking/torneio/${tournamentId}?tab=estadual`}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-sm transition-all ${
              tab === "estadual"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t('tabState')}
          </Link>
        </div>

        {tab === "estadual" && !user?.state ? (
          <div className="text-center py-8 text-slate-500 font-medium">
            {t('needState')}
          </div>
        ) : (
          <TournamentRanking
            ranking={ranking}
            currentUserId={user?.id}
            tournamentId={tournamentId}
            hasStarted={started}
          />
        )}
      </main>
    </div>
  );
}
