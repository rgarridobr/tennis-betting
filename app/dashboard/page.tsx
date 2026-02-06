import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments, getUserStats, getGlobalRanking } from '@/lib/data'
import { HeroSection } from '@/components/dashboard/hero-section'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TournamentCard } from '@/components/dashboard/tournament-card'
import { RankingSection } from '@/components/dashboard/ranking-section'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [tournaments, stats, ranking] = await Promise.all([
    getTournaments(),
    getUserStats(user.id),
    getGlobalRanking(10),
  ])

  const activeTournaments = tournaments.filter(t => t.status === 'active')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <HeroSection user={user} />

      <main className="container mx-auto px-4 pb-8">
        <StatsCards stats={stats} />

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeTournaments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Torneios Ativos</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {activeTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                </div>
              </section>
            )}

            {upcomingTournaments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Proximos Torneios</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                </div>
              </section>
            )}

            {activeTournaments.length === 0 && upcomingTournaments.length === 0 && (
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
  )
}
