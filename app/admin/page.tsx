import { getTournaments } from '@/lib/data'
import { getAllUsers } from '@/lib/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const [tournaments, users] = await Promise.all([
    getTournaments(),
    getAllUsers(),
  ])

  const liveTournaments = tournaments.filter(t => t.status === 'live').length
  const totalPredictions = users.reduce((sum, u) => sum + Number(u.total_predictions), 0)

  const stats = [
    { label: 'Torneios', value: tournaments.length, icon: Trophy },
    { label: 'Ao Vivo', value: liveTournaments, icon: Calendar },
    { label: 'Usuários', value: users.length, icon: Users },
    { label: 'Palpites', value: totalPredictions, icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Painel Admin</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
