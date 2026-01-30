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
                        variant={match.status === 'finished' ? 'secondary' : 'outline'}
                      >
                        {match.status === 'finished' ? 'Finalizado' : 'Agendado'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {match.player1_name} vs {match.player2_name}
                    </p>
                    {match.status === 'finished' ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Placar: {match.player1_score} - {match.player2_score}
                        {match.winner && (
                          <span className="ml-2">
                            (Vencedor: {match.winner === 1 ? match.player1_name : match.player2_name})
                          </span>
                        )}
                      </p>
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
