import { getSession } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POINTS_VARIANTS, getActiveTournament } from '@/lib/data';
import { getRoundName, cn } from '@/lib/utils';
import { Info, HelpCircle, Trophy, Clock, Edit3, Target, AlertTriangle } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function RulesPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (user.is_admin) {
    redirect('/admin');
  }

  const [activeTournament] = await Promise.all([getActiveTournament()]);

  const categories = POINTS_VARIANTS;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title="Regras do Bolão" subtitle="Entenda como funciona a pontuação e as participações" />

      <main className="container mx-auto px-4 md:px-32 py-8 space-y-8">
        {/* General Rules */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Início e Prazos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                As inscrições e palpites abrem assim que a chave do torneio é sorteada e publicada. Você pode realizar
                seus palpites até o horário de início da primeira partida do torneio.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Alteração de Palpites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                Você pode alterar seus palpites quantas vezes quiser até o momento do bloqueio (início do torneio). Após
                o início das partidas, os palpites são congelados e não podem mais ser modificados.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Como Pontuar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                Você ganha pontos a cada acerto de vencedor. A pontuação é progressiva: rodadas finais valem mais. A última partida (Final) premia exclusivamente quem acerta o Campeão do torneio.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Scoring Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sistema de Pontuação</h2>
          </div>

          <div className="grid gap-6">
            {categories.map((cat) => {
              const config = cat;
              return (
                <Card key={cat.id} className="border-0 shadow-md overflow-hidden">
                  <div className="bg-slate-900 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-slate-400 text-xs">{cat.description}</p>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 divide-x divide-y divide-slate-100">
                      {config.rounds.map((points, idx) => {
                        const isCampeao = idx === config.rounds.length - 1;
                        const isFinal = idx === config.rounds.length - 2;
                        const roundName = getRoundName(idx + 1, config.rounds.length - 1);

                        let displayTitle = roundName;
                        if (isCampeao) displayTitle = 'Campeão';
                        if (isFinal) displayTitle = 'Final';

                        return (
                          <React.Fragment key={idx}>
                            <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                                {displayTitle}
                              </p>
                              <p className="text-xl font-black text-emerald-600 py-3">
                                {points === null ? '-' : points}
                              </p>
                              <p className="text-[10px] text-slate-500">pontos</p>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Lucky Loser Rule */}
        <section>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 md:p-8 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-amber-900 font-black text-lg mb-1 uppercase tracking-tight">Observação Importante</h3>
              <p className="text-amber-800 font-medium leading-relaxed">
                Sempre que um tenista com o status de Lucky Loser(LL) vencer uma partida, não haverá pontuação.
              </p>
            </div>
          </div>
        </section>

        {/* Tie breaker */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Critérios de Desempate</h2>
          </div>
          <p className="text-slate-600 mb-4">
            Caso dois ou mais participantes terminem com a mesma pontuação total, os seguintes critérios serão aplicados
            nesta ordem:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
            <li>Acertou o Campeão do Torneio;</li>
            <li>Acertou o Campeão e o Vice-Campeão;</li>
            <li>Maior número total de acertos (vencedores de partidas);</li>
            <li>Maior pontuação no Ranking Geral (pontuação acumulada nas etapas);</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
