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
    active: 'Ativo',
    completed: 'Finalizado',
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Torneios</h1>
        <Button asChild>
          <Link href="/admin/torneios/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Torneio
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Todos os Torneios</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <p className="text-center py-8 text-slate-500">
              Nenhum torneio cadastrado. Crie o primeiro Grand Slam!
            </p>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-slate-900">{tournament.name}</h3>
                      <Badge className={statusColors[tournament.status] || 'bg-slate-100 text-slate-600'}>
                        {statusLabels[tournament.status] || tournament.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {tournament.location} - {tournament.surface}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TournamentStatusSelect
                      tournamentId={tournament.id}
                      currentStatus={tournament.status}
                    />
                    <Button variant="outline" size="sm" asChild className="bg-transparent">
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
