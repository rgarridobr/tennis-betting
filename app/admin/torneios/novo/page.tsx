import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TournamentForm } from '@/components/admin/tournament-form'

export default function NewTournamentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Novo Torneio</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <TournamentForm />
        </CardContent>
      </Card>
    </div>
  )
}
