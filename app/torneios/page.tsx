import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTournaments } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentCard } from '@/components/dashboard/tournament-card'

export default async function TournamentsPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const tournaments = await getTournaments()
  
  const liveTournaments = tournaments.filter((t) => t.status === 'live')
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming')
  const finishedTournaments = tournaments.filter((t) => t.status === 'finished')

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Torneios</h1>
        
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
