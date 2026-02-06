import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentCard } from '@/components/dashboard/tournament-card'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Zap } from 'lucide-react'

export default async function TournamentsPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const tournaments = await getTournaments()

  const activeTournaments = tournaments.filter(t => t.status === 'active')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const completedTournaments = tournaments.filter(t => t.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <PageHero
        title="Torneios"
        subtitle="Participe dos maiores Grand Slams do tenis mundial"
      >
        <div className="flex items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-sm px-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Ativos</p>
                <p className="text-xl font-bold text-white">{activeTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm px-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Proximos</p>
                <p className="text-xl font-bold text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 py-8">
        {activeTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Ativos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {upcomingTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Proximos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {completedTournaments.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Finalizados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {tournaments.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhum torneio disponivel no momento.</p>
          </div>
        )}
      </main>
    </div>
  )
}
