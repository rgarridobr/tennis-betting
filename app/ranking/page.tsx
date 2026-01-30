import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGlobalRanking } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default async function RankingPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const ranking = await getGlobalRanking(100)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Ranking Geral</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Classificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum participante ainda
              </p>
            ) : (
              <div className="space-y-2">
                {ranking.map((entry) => {
                  const isCurrentUser = user.id === entry.user_id
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.rank === 1 
                            ? 'bg-yellow-500 text-white' 
                            : entry.rank === 2 
                              ? 'bg-gray-400 text-white' 
                              : entry.rank === 3 
                                ? 'bg-orange-400 text-white' 
                                : 'bg-muted text-muted-foreground'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                            {entry.user_name}
                            {isCurrentUser && <span className="text-xs ml-2">(você)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.correct_predictions} acertos de {entry.total_predictions} palpites
                            {entry.total_predictions > 0 && (
                              <span className="ml-2">
                                ({Math.round((entry.correct_predictions / entry.total_predictions) * 100)}% de precisão)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.total_points}
                        </p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
