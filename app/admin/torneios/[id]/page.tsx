import { notFound } from 'next/navigation'
import { getTournamentById, getBracketMatches, getPlayers, ROUND_NAMES } from '@/lib/data'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BracketRoundManager } from '@/components/admin/bracket-round-manager'
import { PlayerManager } from '@/components/admin/player-manager'
import { TournamentStatusSelect } from '@/components/admin/tournament-status-select'
import { Trophy, Clock, Hash, MapPin, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManageTournamentPage({ params }: Props) {
  const { id } = await params

  if (id === 'novo') return null

  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const [matches, players] = await Promise.all([
    getBracketMatches(tournamentId),
    getPlayers()
  ])

  const completedMatches = matches.filter(m => m.status === 'completed').length
  const scheduledMatches = matches.filter(m => m.status === 'scheduled').length
  const pendingMatches = matches.filter(m => m.status === 'pending').length
  const totalMatches = matches.length

  const matchesByRound: Record<number, typeof matches> = {}
  for (const m of matches) {
    if (!matchesByRound[m.round]) matchesByRound[m.round] = []
    matchesByRound[m.round].push(m)
  }

  const statusLabels: Record<string, string> = {
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  }

  const surfaceLabels: Record<string, string> = {
    Hard: 'Quadra Dura',
    Clay: 'Saibro',
    Grass: 'Grama',
  }

  return (
    <>
      <PageHero
        title={tournament.name}
        subtitle={`${tournament.location} \u2022 ${surfaceLabels[tournament.surface] || tournament.surface}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-[10px] uppercase font-bold tracking-wider">Finalizadas</p>
                <p className="text-xl font-bold text-white leading-none">{completedMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-blue-100/70 text-[10px] uppercase font-bold tracking-wider">Agendadas</p>
                <p className="text-xl font-bold text-white leading-none">{scheduledMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                <Hash className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-amber-100/70 text-[10px] uppercase font-bold tracking-wider">Pendentes</p>
                <p className="text-xl font-bold text-white leading-none">{pendingMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-purple-100/70 text-[10px] uppercase font-bold tracking-wider">Jogadores</p>
                <p className="text-xl font-bold text-white leading-none">{players.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Status e Voltar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild className="w-fit text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Link href="/admin/torneios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista
            </Link>
          </Button>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <Badge className={`rounded-lg px-3 py-1 ${
              tournament.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              tournament.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {statusLabels[tournament.status] || tournament.status}
            </Badge>
            <div className="h-6 w-px bg-slate-100" />
            <TournamentStatusSelect
              tournamentId={tournament.id}
              currentStatus={tournament.status}
            />
          </div>
        </div>

        {/* Progresso do Torneio */}
        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden mb-10">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Progresso do Chaveamento</h3>
                <p className="text-sm text-slate-500 mt-1">Acompanhamento de partidas do Grand Slam</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600">
                  {Math.round((completedMatches / totalMatches) * 100)}%
                </span>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Concluído</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-4 p-1">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: totalMatches > 0 ? `${(completedMatches / totalMatches) * 100}%` : '0%' }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">Finalizadas ({completedMatches})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-slate-700">Agendadas ({scheduledMatches})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-semibold text-slate-700">Pendentes ({pendingMatches})</span>
              </div>
              <div className="ml-auto text-sm text-slate-400 font-medium">
                Total de {totalMatches} partidas
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Jogadores */}
        <div className="mb-8">
          <PlayerManager players={players} />
        </div>

        {/* Rodadas do Chaveamento */}
        <div className="space-y-8 pb-20">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chaveamento do Torneio</h2>
          </div>

          {[1, 2, 3, 4, 5, 6, 7].map(round => {
            const roundMatches = matchesByRound[round] || []
            if (roundMatches.length === 0) return null

            return (
              <BracketRoundManager
                key={round}
                round={round}
                roundName={ROUND_NAMES[round]}
                matches={roundMatches}
                players={players}
                tournamentId={tournamentId}
              />
            )
          })}
        </div>
      </main>
    </>
  )
}
