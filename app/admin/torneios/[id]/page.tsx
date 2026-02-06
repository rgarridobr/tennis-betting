import { notFound } from 'next/navigation'
import { getTournamentById, getMatchesByTournament, ROUND_ORDER, ROUND_MATCHES } from '@/lib/data'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BracketRoundManager } from '@/components/admin/bracket-round-manager'
import { Trophy, Users, Hash } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManageTournamentPage({ params }: Props) {
  const { id } = await params
  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const matches = await getMatchesByTournament(tournamentId)

  const totalMatches = matches.length
  const completedMatches = matches.filter(m => m.status === 'completed').length
  const scheduledMatches = matches.filter(m => m.status === 'scheduled').length
  const pendingMatches = matches.filter(m => m.status === 'pending').length

  // Group matches by round
  const matchesByRound: Record<string, typeof matches> = {}
  for (const round of ROUND_ORDER) {
    matchesByRound[round] = matches.filter(m => m.round === round)
  }

  const statusLabels: Record<string, string> = {
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  }

  return (
    <>
      <PageHero
        title={tournament.name}
        subtitle={`${tournament.location} - ${tournament.surface}`}
      >
        <div className="flex items-center gap-3">
          <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
            {statusLabels[tournament.status] || tournament.status}
          </Badge>
        </div>
      </PageHero>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Hash className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">{totalMatches}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Agendadas</p>
              <p className="text-lg font-bold text-slate-900">{scheduledMatches}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Finalizadas</p>
              <p className="text-lg font-bold text-slate-900">{completedMatches}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Hash className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pendentes</p>
              <p className="text-lg font-bold text-slate-900">{pendingMatches}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bracket Rounds */}
      <div className="mt-8 space-y-6">
        {ROUND_ORDER.map(round => {
          const roundMatches = matchesByRound[round] || []
          if (roundMatches.length === 0) return null

          return (
            <BracketRoundManager
              key={round}
              round={round}
              matches={roundMatches}
              tournamentId={tournamentId}
              expectedMatches={ROUND_MATCHES[round]}
            />
          )
        })}
      </div>
    </>
  )
}
