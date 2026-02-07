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
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader user={user} />

      <PageHero
        title="Torneios"
        subtitle="Participe dos maiores Grand Slams do tênis mundial"
      >
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Ativos</p>
                <p className="text-2xl font-black text-white">{activeTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Próximos</p>
                <p className="text-2xl font-black text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 py-12">
        {activeTournaments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios ao Vivo</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {upcomingTournaments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-amber-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Próximos Torneios</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {completedTournaments.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-slate-300 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios Finalizados</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
