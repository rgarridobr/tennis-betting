import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserPredictionsWithDetails, getUserStats, ROUND_POINTS } from '@/lib/data';
import { getRoundName } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, TrendingUp, CheckCircle2, XCircle, Clock, Medal } from 'lucide-react';
import Link from 'next/link';
import type { PredictionWithDetails } from '@/lib/data';

export default async function MeusPalpitesPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const [predictions, stats] = await Promise.all([getUserPredictionsWithDetails(user.id), getUserStats(user.id)]);

  const pendingPredictions = predictions.filter((p) => p.match_status === 'scheduled' || p.match_status === 'pending');
  const completedPredictions = predictions.filter((p) => p.match_status === 'completed');
  const correctPredictions = completedPredictions.filter((p) => p.is_correct);
  const wrongPredictions = completedPredictions.filter((p) => p.is_correct === false);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />

      <PageHero title="Meus Palpites" subtitle="Acompanhe todos os seus palpites e resultados">
        <div className="flex items-center gap-4">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Palpites</p>
                <p className="text-2xl font-black text-white">{stats.total_predictions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Acertos</p>
                <p className="text-2xl font-black text-white">{stats.correct_predictions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-orange-100/70 text-xs font-bold uppercase tracking-wider">Precisão</p>
                <p className="text-2xl font-black text-white">{stats.accuracy}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                <Medal className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-100/70 text-xs font-bold uppercase tracking-wider">Pontos</p>
                <p className="text-2xl font-black text-white">{stats.total_points}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        {predictions.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum palpite ainda</h2>
              <p className="text-slate-600 mb-6">Inscreva-se em um torneio e comece a fazer seus palpites!</p>
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
            <TabsList className="bg-white shadow-sm w-full flex flex-wrap h-auto p-1 gap-1">
              <TabsTrigger
                value="all"
                className="flex-1 min-w-[70px] text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                Todos ({predictions.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex-1 min-w-[70px] text-xs sm:text-sm py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Pendentes ({pendingPredictions.length})
              </TabsTrigger>
              <TabsTrigger
                value="correct"
                className="flex-1 min-w-[70px] text-xs sm:text-sm py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Acertos ({correctPredictions.length})
              </TabsTrigger>
              <TabsTrigger
                value="wrong"
                className="flex-1 min-w-[70px] text-xs sm:text-sm py-2 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Erros ({wrongPredictions.length})
              </TabsTrigger>
            </TabsList>

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
  );
}

function PredictionsList({ predictions }: { predictions: PredictionWithDetails[] }) {
  if (predictions.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <p className="text-slate-500">Nenhum palpite nesta categoria</p>
        </CardContent>
      </Card>
    );
  }

  const grouped: Record<string, PredictionWithDetails[]> = {};
  for (const p of predictions) {
    const key = p.tournament_name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([tournamentName, tournamentPredictions]) => (
        <Card key={tournamentName} className="border-0 shadow-md overflow-hidden pt-0">
          <div className="bg-slate-100 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{tournamentName}</h3>
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
  );
}

function formatPlayerDisplay(name: string | null, type: string, seed: number | null) {
  if (!name) return 'A definir';

  const getIndicator = () => {
    if (type === 'SEED' && seed) return `(${seed})`;
    if (type === 'QUALIFIER') return '(Q)';
    if (type === 'WILDCARD') return '(WC)';
    return null;
  };

  const indicator = getIndicator();
  return (
    <>
      {name}
      {indicator && <span className="text-[10px] text-slate-400 ml-1 font-bold">{indicator}</span>}
    </>
  );
}

function PredictionCard({ prediction }: { prediction: PredictionWithDetails }) {
  const isPending = prediction.match_status === 'scheduled' || prediction.match_status === 'pending';
  const isCorrect = prediction.is_correct === true;
  const isWrong = prediction.is_correct === false;
  const maxRound = Math.ceil(Math.log2(prediction.tournament_size || 2));
  const roundName = getRoundName(prediction.round, maxRound);

  return (
    <div
      className={`px-6 py-4 flex items-center justify-between ${isCorrect ? 'bg-emerald-50/50' : isWrong ? 'bg-red-50/50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPending ? 'bg-amber-100' : isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}
        >
          {isPending ? (
            <Clock className="w-5 h-5 text-amber-600" />
          ) : isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900">
              {formatPlayerDisplay(prediction.player1_name, prediction.player1_type, prediction.player1_seed)}
            </span>
            <span className="text-slate-400">vs</span>
            <span className="font-medium text-slate-900">
              {formatPlayerDisplay(prediction.player2_name, prediction.player2_type, prediction.player2_seed)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline" className="text-xs font-normal">
              {roundName}
            </Badge>
            {prediction.score && <span className="font-mono text-xs">{prediction.score}</span>}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm text-slate-500 mb-1">Seu palpite:</p>
        <p
          className={`font-semibold ${isPending ? 'text-amber-600' : isCorrect ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {prediction.predicted_winner_name}
        </p>
        {!isPending && prediction.winner_name && (
          <p className="text-xs text-slate-500 mt-1">
            Vencedor: <span className="font-medium text-slate-700">{prediction.winner_name}</span>
          </p>
        )}
        {isCorrect && <Badge className="mt-1 bg-emerald-500 text-white text-xs">+{prediction.points_earned} pts</Badge>}
      </div>
    </div>
  );
}
