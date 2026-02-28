import { notFound } from 'next/navigation'
import { getTournamentById, getBracketMatches, getPlayers } from '@/lib/data'
import { getDynamicRoundNames } from '@/lib/utils'
import { isRound1Complete } from '@/lib/admin'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BracketRoundManager } from '@/components/admin/bracket-round-manager'
import { PlayerManager } from '@/components/admin/player-manager'
import { PublishBracketButton } from '@/components/admin/publish-bracket-button'
import { TournamentStatusTransition } from '@/components/admin/tournament-status-transition'
import { TournamentViewToggle } from '@/components/tournament/tournament-view-toggle'
import { TournamentBracket } from '@/components/tournament/tournament-bracket'
import { Trophy, Clock, Hash, Users, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function ManageTournamentPage({ params, searchParams }: Props) {
  const { id } = await params
  const { view = 'list' } = await searchParams

  if (id === 'novo') return null

  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const [matches, players, round1Complete] = await Promise.all([
    getBracketMatches(tournamentId),
    getPlayers(),
    isRound1Complete(tournamentId)
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

  const maxRound = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0
  const dynamicRoundNames = getDynamicRoundNames(maxRound)

  const statusLabels: Record<string, string> = {
    STANDBY: 'Standby (Interno)',
    draft: 'Rascunho',
    UPCOMING: 'Em breve (Visível)',
    OPEN: 'Apostas Abertas',
    LOCKED: 'Apostas Fechadas',
    IN_PROGRESS: 'Em Andamento',
    FINISHED: 'Finalizado',
    published: 'Publicado',
    finished: 'Finalizado',
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  }

  const surfaceLabels: Record<string, string> = {
    Hard: 'Quadra Dura',
    Saibro: 'Saibro',
    Grama: 'Grama',
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
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Finalizadas</p>
                <p className="text-xl font-bold text-white">{completedMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Agendadas</p>
                <p className="text-xl font-bold text-white">{scheduledMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Hash className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Pendentes</p>
                <p className="text-xl font-bold text-white">{pendingMatches}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Jogadores</p>
                <p className="text-xl font-bold text-white">{players.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* Status e Voltar */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="sm" asChild className="bg-transparent">
            <Link href="/admin/torneios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <TournamentStatusTransition tournamentId={tournamentId} status={tournament.status} />
            <Badge className={
              (tournament.status === 'active' || tournament.status === 'OPEN') ? 'bg-emerald-100 text-emerald-700' :
              (tournament.status === 'upcoming' || tournament.status === 'UPCOMING') ? 'bg-amber-100 text-amber-700' :
              (tournament.status === 'IN_PROGRESS' || tournament.status === 'LOCKED') ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-600'
            }>
              {statusLabels[tournament.status] || tournament.status}
            </Badge>
          </div>
        </div>

        {/* Progresso do Torneio */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Progresso do Chaveamento</h3>
              <span className="text-sm text-slate-500">
                {completedMatches} de {totalMatches} partidas
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: totalMatches > 0 ? `${(completedMatches / totalMatches) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Finalizadas ({completedMatches})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Agendadas ({scheduledMatches})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pendentes ({pendingMatches})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Gerenciar Jogadores */}
        <div className="mb-8">
          <PlayerManager players={players} />
        </div>

        {/* Alerta de Rascunho ou Standby */}
        {(tournament.status === 'STANDBY' || tournament.status === 'UPCOMING' || tournament.status === 'draft' || tournament.status === 'upcoming') && (
          <div className={`mb-8 p-6 border-2 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 ${
            (tournament.status === 'UPCOMING' || tournament.status === 'upcoming') ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex items-center gap-4 ${(tournament.status === 'UPCOMING' || tournament.status === 'upcoming') ? 'text-amber-800' : 'text-slate-700'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                (tournament.status === 'UPCOMING' || tournament.status === 'upcoming') ? 'bg-amber-100' : 'bg-slate-200'
              }`}>
                {(tournament.status === 'UPCOMING' || tournament.status === 'upcoming') ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-black text-lg">
                  {tournament.status === 'UPCOMING' || tournament.status === 'upcoming' ? 'Modo Em Breve' : 'Modo Standby'}
                </h3>
                <p className="text-sm font-bold opacity-80">
                  {tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                    ? 'O chaveamento está sendo definido. Publique para permitir resultados e palpites.'
                    : 'O torneio está interno (apenas admin vê). Clique em "Preparar Chaveamento" para gerar a chave e torná-lo visível.'
                  }
                </p>
              </div>
            </div>
            {(tournament.status === 'UPCOMING' || tournament.status === 'upcoming') && <PublishBracketButton tournamentId={tournamentId} isReady={round1Complete} />}
          </div>
        )}

        {/* Rodadas do Chaveamento */}
        <div className="space-y-6 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chaveamento</h2>
              {tournament.status !== 'draft' && (
                <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full">
                  CHAVE FIXA
                </Badge>
              )}
            </div>
            {matches.length > 0 && <TournamentViewToggle currentView={view} />}
          </div>

          {matches.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500 font-medium">O chaveamento ainda não foi gerado.</p>
              </CardContent>
            </Card>
          ) : view === 'bracket' ? (
            <TournamentBracket
              matches={matches}
              userId={0}
              tournamentId={tournamentId}
              predictions={{}}
              canMakePredictions={false}
              roundNames={dynamicRoundNames}
              isAdmin={true}
              players={players}
              tournamentStatus={tournament.status}
            />
          ) : (
            <div className="space-y-6">
              {Object.keys(matchesByRound).map(Number).sort((a, b) => a - b).map(round => {
                const roundMatches = matchesByRound[round] || []
                return (
                  <BracketRoundManager
                    key={round}
                    round={round}
                    roundName={dynamicRoundNames[round]}
                    matches={roundMatches}
                    players={players}
                    tournamentId={tournamentId}
                    tournamentStatus={tournament.status}
                    isFinalRound={round === maxRound}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
