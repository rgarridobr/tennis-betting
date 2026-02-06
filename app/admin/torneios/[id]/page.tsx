import { notFound } from 'next/navigation'
import { getTournamentById, getMatchesByTournament } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MatchForm } from '@/components/admin/match-form'
import { MatchResultForm } from '@/components/admin/match-result-form'

interface ManageTournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function ManageTournamentPage({ params }: ManageTournamentPageProps) {
  const { id } = await params
  const tournamentId = parseInt(id, 10)
  if (isNaN(tournamentId)) notFound()

  const tournament = await getTournamentById(tournamentId)
  if (!tournament) notFound()

  const matches = await getMatchesByTournament(tournamentId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{tournament.name}</h1>
      <p className="text-muted-foreground mb-6">{tournament.location}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Partida</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchForm tournamentId={tournamentId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partidas ({matches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhuma partida cadastrada
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{match.round}</Badge>
                      <Badge
                        variant={match.status === 'completed' ? 'secondary' : 'outline'}
                      >
                        {match.status === 'completed' ? 'Finalizado' : match.status === 'live' ? 'Ao Vivo' : 'Agendado'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {match.player1_name} vs {match.player2_name}
                    </p>
                    {match.status === 'completed' ? (
                      <div className="mt-1 space-y-0.5">
                        {match.score && (
                          <p className="text-xs text-muted-foreground">
                            Placar: <span className="font-medium">{match.score}</span>
                          </p>
                        )}
                        {match.winner && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Vencedor: {match.winner}
                          </p>
                        )}
                      </div>
                    ) : (
                      <MatchResultForm
                        matchId={match.id}
                        tournamentId={tournamentId}
                        player1Name={match.player1_name}
                        player2Name={match.player2_name}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
