import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserPredictionsWithDetails, getUserStats, getTournaments } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from 'lucide-react'
import Link from 'next/link'

const roundLabels: Record<string, string> = {
  R128: '1a Rodada',
  R64: '2a Rodada',
  R32: '3a Rodada',
  R16: 'Oitavas',
  QF: 'Quartas',
  SF: 'Semi',
  F: 'Final',
}

export default async function MeusPalpitesPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [predictions, stats, tournaments] = await Promise.all([
    getUserPredictionsWithDetails(user.id),
    getUserStats(user.id),
    getTournaments(),
  ])

  // Group predictions by tournament
  const predictionsByTournament: Record<number, typeof predictions> = {}
  for (const p of predictions) {
    if (!predictionsByTournament[p.tournament_id]) {
      predictionsByTournament[p.tournament_id] = []
    }
    predictionsByTournament[p.tournament_id].push(p)
  }

  const pendingPredictions = predictions.filter(p => p.match_status === 'scheduled')
  const finishedPredictions = predictions.filter(p => p.match_status === 'finished')
  const correctPredictions = finishedPredictions.filter(p => p.is_correct)
  const wrongPredictions = finishedPredictions.filter(p => p.is_correct === false)

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Palpites</h1>
          <p className="text-emerald-100 mb-8">Acompanhe todos os seus palpites e resultados</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-0 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Total de Palpites</p>
                    <p className="text-3xl font-bold text-white">{stats.total_predictions}</p>
                  </div>
                  <Target className="w-8 h-8 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-0 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Acertos</p>
                    <p className="text-3xl font-bold text-white">{stats.correct_predictions}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-0 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Precisão</p>
                    <p className="text-3xl font-bold text-white">{stats.accuracy}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-0 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Pontos Totais</p>
                    <p className="text-3xl font-bold text-white">{stats.total_points}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {predictions.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum palpite ainda</h2>
              <p className="text-slate-600 mb-6">
                Inscreva-se em um torneio e comece a fazer seus palpites!
              </p>
              <Link 
                href="/torneios" 
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Ver Torneios
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="all" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                  Todos ({predictions.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
                  <Clock className="w-4 h-4 mr-1" />
                  Pendentes ({pendingPredictions.length})
                </TabsTrigger>
                <TabsTrigger value="correct" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Acertos ({correctPredictions.length})
                </TabsTrigger>
                <TabsTrigger value="wrong" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                  <XCircle className="w-4 h-4 mr-1" />
                  Erros ({wrongPredictions.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <PredictionsList predictions={predictions} />
            </TabsContent>
            
            <TabsContent value="pending">
              <PredictionsList predictions={pendingPredictions} />
            </TabsContent>
            
            <TabsContent value="correct">
              <PredictionsList predictions={correctPredictions} />
            </TabsContent>
            
            <TabsContent value="wrong">
              <PredictionsList predictions={wrongPredictions} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

function PredictionsList({ predictions }: { predictions: any[] }) {
  if (predictions.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">Nenhum palpite nesta categoria</p>
        </CardContent>
      </Card>
    )
  }

  // Group by tournament
  const grouped: Record<string, any[]> = {}
  for (const p of predictions) {
    const key = p.tournament_name
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([tournamentName, tournamentPredictions]) => (
        <Card key={tournamentName} className="border-0 shadow-md overflow-hidden">
          <div className="bg-slate-100 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">{tournamentName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {tournamentPredictions[0]?.tournament_surface === 'clay' ? 'Saibro' : 
                   tournamentPredictions[0]?.tournament_surface === 'grass' ? 'Grama' : 'Quadra dura'}
                </Badge>
              </div>
              <span className="text-sm text-slate-600">
                {tournamentPredictions.length} palpite{tournamentPredictions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {tournamentPredictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PredictionCard({ prediction }: { prediction: any }) {
  const predictedPlayerName = prediction.predicted_winner === 1 
    ? prediction.player1_name 
    : prediction.player2_name
  
  const isPending = prediction.match_status === 'scheduled' || prediction.match_status === 'live'
  const isCorrect = prediction.is_correct === true
  const isWrong = prediction.is_correct === false

  const winnerName = prediction.winner 
    ? (prediction.winner === 1 ? prediction.player1_name : prediction.player2_name)
    : null

  return (
    <div className={`px-6 py-4 flex items-center justify-between ${
      isCorrect ? 'bg-emerald-50/50' : isWrong ? 'bg-red-50/50' : ''
    }`}>
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPending ? 'bg-amber-100' : isCorrect ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {isPending ? (
            <Clock className={`w-5 h-5 ${prediction.match_status === 'live' ? 'text-emerald-600' : 'text-amber-600'}`} />
          ) : isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>

        {/* Match Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900">
              {prediction.player1_name}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="font-medium text-slate-900">
              {prediction.player2_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline" className="text-xs font-normal">
              {roundLabels[prediction.round] || prediction.round}
            </Badge>
            <span>
              {new Date(prediction.match_date).toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Result */}
      <div className="text-right">
        <p className="text-sm text-slate-500 mb-1">Seu palpite:</p>
        <p className={`font-semibold ${
          isPending ? 'text-amber-600' : isCorrect ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {predictedPlayerName}
        </p>
        {!isPending && winnerName && (
          <p className="text-xs text-slate-500 mt-1">
            Vencedor: <span className="font-medium text-slate-700">{winnerName}</span>
          </p>
        )}
        {isCorrect && (
          <Badge className="mt-1 bg-emerald-500 text-white text-xs">
            +{prediction.points_earned} pts
          </Badge>
        )}
      </div>
    </div>
  )
}
