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
  getUserPublicInfo,
} from '@/lib/data'
import { getDynamicRoundNames } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TournamentHeader } from '@/components/tournament/tournament-header'
import { MatchList } from '@/components/tournament/match-list'
import { FileText, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { TournamentBracket } from '@/components/tournament/tournament-bracket'
import { EnrollmentBanner } from '@/components/tournament/enrollment-banner'
import { TournamentViewToggle } from '@/components/tournament/tournament-view-toggle'
import { TournamentRanking } from '@/components/tournament/tournament-ranking'

interface TournamentPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string, viewUser?: string }>
}

export default async function TournamentPage({ params, searchParams }: TournamentPageProps) {
  const user = await getSession()
  if (!user) redirect('/login')

  const { id } = await params
  const { view = 'bracket', viewUser } = await searchParams
  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const started = await hasTournamentStarted(tournamentId)
  const targetUserId = (viewUser && started) ? parseInt(viewUser, 10) : user.id
  const isViewingOthers = targetUserId !== user.id

  const [matches, targetPredictions, enrollment, participants, tournamentPlayers, ranking, targetUserInfo] = await Promise.all([
    getBracketMatches(tournamentId),
    getUserPredictions(targetUserId, tournamentId),
    getEnrollment(user.id, tournamentId),
    getTournamentParticipantCount(tournamentId),
    getTournamentPlayers(tournamentId),
    getTournamentRanking(tournamentId),
    isViewingOthers ? getUserPublicInfo(targetUserId) : null
  ])

  const enrolled = !!enrollment

  // Map: bracketMatchId -> prediction object
  const predictionsRecord: Record<number, { winnerId: number, score?: string }> = {}
  for (const p of targetPredictions) {
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
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isViewingOthers ? 'Visualizando Chave' : 'Chaveamento'}
              </h2>
              {enrolled && !isViewingOthers && (
                <span className="text-sm text-emerald-600 font-bold">
                  Inscrito - Faça seus palpites!
                </span>
              )}
            </div>

            <Link
              href="/regras"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors pb-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Regras do Torneio
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isViewingOthers && (
              <Link
                href={`/torneio/${tournamentId}?view=ranking`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Ranking
              </Link>
            )}

            {tournament.status !== 'upcoming' && tournament.status !== 'draft' && tournament.status !== 'STANDBY' && (
              <TournamentViewToggle currentView={view} />
            )}
          </div>
        </div>

        {isViewingOthers && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-900 font-black text-lg leading-tight">
                  Você está visualizando os palpites de <span className="text-blue-600">{targetUserInfo?.name || 'Usuário'}</span>
                </p>
                <p className="text-blue-700/70 text-sm font-bold uppercase tracking-wider">Modo de Apenas Visualização</p>
              </div>
            </div>
          </div>
        )}

        {(tournament.status === 'upcoming' || tournament.status === 'draft' || tournament.status === 'STANDBY' || tournament.status === 'UPCOMING' || matches.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-6">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Chaveamento indisponível para este torneio
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              O chaveamento para este torneio ainda não está disponível. Por favor, volte mais tarde para visualizar o chaveamento assim que for liberado.
            </p>
          </div>
        ) : isViewingOthers && targetPredictions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-6">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Palpite do usuário não foi registrado
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              Este usuário não registrou palpites para este torneio.
            </p>
          </div>
        ) : view === 'ranking' ? (
          <TournamentRanking
            ranking={ranking}
            currentUserId={user.id}
            tournamentId={tournamentId}
            hasStarted={started}
          />
        ) : view === 'list' ? (
          <MatchList
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={enrolled && !started && !isViewingOthers}
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
            canMakePredictions={enrolled && !started && !isViewingOthers}
            roundNames={dynamicRoundNames}
            bracketSubmitted={isViewingOthers ? false : enrollment?.bracket_submitted}
            hasStarted={started}
          />
        )}
      </main>
    </div>
  )
}
