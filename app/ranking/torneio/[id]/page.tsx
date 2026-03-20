import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import {
  getTournamentRanking,
  getUserStats,
  getTournamentById,
  hasTournamentStarted,
  getActiveTournament
} from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { TournamentRanking } from '@/components/tournament/tournament-ranking';

interface TournamentRankingPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentRankingPage({ params }: TournamentRankingPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.is_admin) redirect('/admin');

  const { id } = await params;
  const tournamentId = parseInt(id, 10);
  if (isNaN(tournamentId)) notFound();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) notFound();

  const [ranking, userStats, started, activeTournament] = await Promise.all([
    getTournamentRanking(tournamentId),
    getUserStats(user.id),
    hasTournamentStarted(tournamentId),
    getActiveTournament()
  ]);

  // Find current user's position in this tournament
  const userRankEntry = ranking.find((r) => r.user_id === user.id);
  const userPosition = userRankEntry?.rank || '-';
  const userPoints = userRankEntry?.total_points || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      {/* Header */}
      <PageHero
        title={`Ranking: ${tournament.name}`}
        subtitle="Veja a classificação dos participantes neste torneio"
      >
        <Card className="bg-white/10 border-0 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{userPosition}º</span>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Sua posição no torneio</p>
              <p className="text-white font-semibold">
                {user.nickname ||
                  user.name.charAt(0).toUpperCase() +
                    user.name.slice(1).toLowerCase().split(' ')[0] +
                    (user.name.split(' ').length > 1
                      ? ' ' + user.name.split(' ')[1].charAt(0).toUpperCase() + '.'
                      : '')}
              </p>
              <p className="text-amber-300 font-bold">{userPoints} pontos</p>
            </div>
          </CardContent>
        </Card>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        <TournamentRanking
          ranking={ranking}
          currentUserId={user.id}
          tournamentId={tournamentId}
          hasStarted={started}
        />
      </main>
    </div>
  );
}
