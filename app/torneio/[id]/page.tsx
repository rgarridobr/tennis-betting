import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import {
  getTournamentById,
  getBracketMatches,
  getUserPredictions,
  isUserEnrolled,
  getTournamentParticipantCount,
  getTournamentPlayers,
  hasTournamentStarted,
  getEnrollment,
  getTournamentRanking,
} from '@/lib/data'
import { getDynamicRoundNames } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentHeader } from '@/components/tournament/tournament-header'
import { MatchList } from '@/components/tournament/match-list'
import { TournamentBracket } from '@/components/tournament/tournament-bracket'
import { EnrollmentBanner } from '@/components/tournament/enrollment-banner'
import { TournamentViewToggle } from '@/components/tournament/tournament-view-toggle'
import { TournamentRanking } from '@/components/tournament/tournament-ranking'

interface TournamentPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function TournamentPage({ params, searchParams }: TournamentPageProps) {
  const user = await getSession()
  if (!user) redirect('/login')

  const { id } = await params
  const { view = 'bracket' } = await searchParams
  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const [matches, userPredictions, enrollment, participants, tournamentPlayers, started, ranking] = await Promise.all([
    getBracketMatches(tournamentId),
    getUserPredictions(user.id, tournamentId),
    getEnrollment(user.id, tournamentId),
    getTournamentParticipantCount(tournamentId),
    getTournamentPlayers(tournamentId),
    hasTournamentStarted(tournamentId),
    getTournamentRanking(tournamentId),
  ])

  const enrolled = !!enrollment

  // Map: bracketMatchId -> prediction object
  const predictionsRecord: Record<number, { winnerId: number, score?: string }> = {}
  for (const p of userPredictions) {
    predictionsRecord[p.bracket_match_id] = {
      winnerId: p.predicted_winner_id,
      score: p.predicted_score || undefined
    }
  }

  const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0
  const dynamicRoundNames = getDynamicRoundNames(maxRound)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <TournamentHeader tournament={tournament} participants={participants} />

      <main className="container mx-auto px-4 md:px-8 py-8">
        {!enrolled && (
          <EnrollmentBanner tournament={tournament} />
        )}


        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chaveamento</h2>
            {enrolled && (
              <span className="text-sm text-emerald-600 font-bold">
                Inscrito - Faça seus palpites!
              </span>
            )}
          </div>

          {tournament.status !== 'upcoming' && tournament.status !== 'draft' && tournament.status !== 'STANDBY' && (
            <TournamentViewToggle currentView={view} />
          )}
        </div>

        {(tournament.status === 'upcoming' || tournament.status === 'draft' || tournament.status === 'STANDBY' || tournament.status === 'UPCOMING' || matches.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-6">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Chaveamento indisponível para este torneio
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              O chaveamento para este torneio ainda não está disponível. Por favor, volte mais tarde para visualizar o chaveamento assim que for liberado.
            </p>
          </div>
        ) : view === 'ranking' ? (
          <TournamentRanking
            ranking={ranking}
            currentUserId={user.id}
          />
        ) : view === 'list' ? (
          <MatchList
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={enrolled && !started}
            roundNames={dynamicRoundNames}
            tournamentCategory={tournament.category}
            tournamentSize={tournament.size}
          />
        ) : (
          <TournamentBracket
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={enrolled && !started}
            roundNames={dynamicRoundNames}
            bracketSubmitted={enrollment?.bracket_submitted}
            hasStarted={started}
          />
        )}
      </main>
    </div>
  )
}
