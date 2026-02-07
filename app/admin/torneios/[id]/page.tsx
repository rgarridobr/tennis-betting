import { notFound } from 'next/navigation'
import { getTournamentById, getBracketMatches, getPlayers, ROUND_NAMES } from '@/lib/data'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BracketRoundManager } from '@/components/admin/bracket-round-manager'
import { PlayerManager } from '@/components/admin/player-manager'
import { TournamentStatusSelect } from '@/components/admin/tournament-status-select'
import { PublishBracketButton } from '@/components/admin/publish-bracket-button'
import { Trophy, Clock, Hash, MapPin, Users, ArrowLeft, AlertTriangle } from 'lucide-react'
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
    draft: 'Rascunho',
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

      <main className="container mx-auto px-4 py-8">
        {/* Status e Voltar */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="sm" asChild className="bg-transparent">
            <Link href="/admin/torneios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Badge className={
              tournament.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              tournament.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }>
              {statusLabels[tournament.status] || tournament.status}
            </Badge>
            <TournamentStatusSelect
              tournamentId={tournament.id}
              currentStatus={tournament.status}
            />
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

        {/* Alerta de Rascunho */}
        {(tournament.status === 'draft' || tournament.status === 'upcoming') && (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-amber-800">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Modo Rascunho</h3>
                <p className="text-sm font-bold opacity-80">
                  O chaveamento está sendo definido. Use os botões <b>"Definir Confronto"</b> na 1ª Rodada abaixo para cadastrar os jogadores. Publique para permitir resultados.
                </p>
              </div>
            </div>
            <PublishBracketButton tournamentId={tournamentId} />
          </div>
        )}

        {/* Rodadas do Chaveamento */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chaveamento</h2>
            {tournament.status !== 'draft' && (
              <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full">
                CHAVE FIXA
              </Badge>
            )}
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
                tournamentStatus={tournament.status}
              />
            )
          })}
        </div>
      </main>
    </>
  )
}
