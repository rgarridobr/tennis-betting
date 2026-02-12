import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import {
  getTournamentById,
  getBracketMatches,
  getUserPredictions,
  isUserEnrolled,
  getTournamentParticipantCount,
  ROUND_NAMES,
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

  const [matches, userPredictions, enrolled, participants] = await Promise.all([
    getBracketMatches(tournamentId),
    getUserPredictions(user.id, tournamentId),
    isUserEnrolled(user.id, tournamentId),
    getTournamentParticipantCount(tournamentId),
  ])

  // Map: bracketMatchId -> predicted_winner_id
  const predictionsRecord: Record<number, number> = {}
  for (const p of userPredictions) {
    predictionsRecord[p.bracket_match_id] = p.predicted_winner_id
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <TournamentHeader tournament={tournament} participants={participants} />

      <main className="container mx-auto px-4 md:px-32 py-8">
        {!enrolled && (
          <EnrollmentBanner tournament={tournament} />
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Chaveamento</h2>
          {enrolled && (
            <span className="text-sm text-emerald-600 font-medium">
              Inscrito - Faça seus palpites!
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>O chaveamento ainda não foi gerado.</p>
            <p className="text-sm mt-2">Volte mais tarde para fazer seus palpites.</p>
          </div>
        ) : (
          <MatchList
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={enrolled}
            roundNames={ROUND_NAMES}
          />
        )}
      </main>
    </div>
  )
}
