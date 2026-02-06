import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import {
  getTournamentById,
  getMatchesByTournament,
  getUserPredictions,
  getUserTournamentStatus,
  getTournamentParticipants,
  getTournamentPrizePool,
} from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentHeader } from '@/components/tournament/tournament-header'
import { MatchList } from '@/components/tournament/match-list'
import { EnrollmentBanner } from '@/components/tournament/enrollment-banner'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const user = await getSession()
  if (!user) redirect('/login')

  const { id } = await params
  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const [matches, userPredictions, enrollmentStatus, participants, prizePool] =
    await Promise.all([
      getMatchesByTournament(tournamentId),
      getUserPredictions(user.id, tournamentId),
      getUserTournamentStatus(user.id, tournamentId),
      getTournamentParticipants(tournamentId),
      getTournamentPrizePool(tournamentId),
    ])

  // Convert to plain object: matchId -> predicted winner name (string)
  const predictionsRecord: Record<number, string> = {}
  for (const p of userPredictions) {
    predictionsRecord[p.match_id] = p.predicted_winner
  }

  const canMakePredictions = enrollmentStatus.payment_status === 'paid'

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <TournamentHeader
        tournament={tournament}
        participants={participants}
        prizePool={prizePool}
      />

      <main className="container mx-auto px-4 py-8">
        {!canMakePredictions && (
          <EnrollmentBanner
            tournament={tournament}
            participants={participants}
            prizePool={prizePool}
            enrollmentStatus={enrollmentStatus}
          />
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Partidas</h2>
          {canMakePredictions && (
            <span className="text-sm text-emerald-600 font-medium">
              Inscrito - Faça seus palpites!
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma partida cadastrada ainda.</p>
            <p className="text-sm mt-2">
              Volte mais tarde para fazer seus palpites.
            </p>
          </div>
        ) : (
          <MatchList
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={canMakePredictions}
          />
        )}
      </main>
    </div>
  )
}
