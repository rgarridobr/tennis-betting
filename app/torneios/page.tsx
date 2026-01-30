import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentCard } from '@/components/dashboard/tournament-card'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Calendar, Zap } from 'lucide-react'

export default async function TournamentsPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const tournaments = await getTournaments()
  
  const liveTournaments = tournaments.filter((t) => t.status === 'live')
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming')
  const finishedTournaments = tournaments.filter((t) => t.status === 'finished')

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      
      <PageHero 
        title="Torneios" 
        subtitle="Participe dos maiores torneios de tênis do mundo"
      >
        <div className="flex items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-sm px-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Ao vivo</p>
                <p className="text-xl font-bold text-white">{liveTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm px-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Próximos</p>
                <p className="text-xl font-bold text-white">{upcomingTournaments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>
      
      <main className="container mx-auto px-4 py-8">
        
        {liveTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Ao Vivo</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}
        
        {upcomingTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Próximos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}
        
        {finishedTournaments.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Finalizados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {finishedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}
        
        {tournaments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum torneio disponível no momento.</p>
          </div>
        )}
      </main>
    </div>
  )
}
