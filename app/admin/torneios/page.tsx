import { getTournaments } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Settings } from 'lucide-react'
import { TournamentStatusSelect } from '@/components/admin/tournament-status-select'

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments()

  const statusLabels: Record<string, string> = {
    upcoming: 'Em breve',
    live: 'Ao vivo',
    finished: 'Finalizado',
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-secondary text-secondary-foreground',
    live: 'bg-primary text-primary-foreground',
    finished: 'bg-muted text-muted-foreground',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Torneios</h1>
        <Button asChild>
          <Link href="/admin/torneios/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Torneio
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Torneios</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum torneio cadastrado
            </p>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{tournament.name}</h3>
                      <Badge className={statusColors[tournament.status]}>
                        {statusLabels[tournament.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tournament.location} • {tournament.surface}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TournamentStatusSelect
                      tournamentId={tournament.id}
                      currentStatus={tournament.status}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/torneios/${tournament.id}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
