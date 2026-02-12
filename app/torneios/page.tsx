import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments, getTournamentsActive } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentCard } from '@/components/dashboard/tournament-card'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Zap, Trophy } from 'lucide-react'

export default async function TournamentsPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const tournaments = await getTournamentsActive()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardHeader user={user} />

      <PageHero
        title="Torneios"
        subtitle="Participe dos maiores torneios do tênis mundial"
      >
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Disponíveis</p>
                <p className="text-2xl font-black text-white">{tournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-12">
        {tournaments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios Ativos</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
        )}

        {tournaments.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum torneio disponível</h2>
              <p className="text-slate-600 mb-6">
                No momento não temos torneios abertos para palpites. Volte em breve!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
