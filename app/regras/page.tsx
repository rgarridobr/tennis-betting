import { getSession } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POINTS_VARIANTS, getActiveTournament } from '@/lib/data';
import { getRoundName, cn } from '@/lib/utils';
import { Info, HelpCircle, Trophy, Clock, Edit3, Target, AlertTriangle, Users, Award } from 'lucide-react';
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

      <PageHero title="Regras do Grupo" subtitle="Entenda como funciona a pontuação e as participações" />

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
                As inscrições nos torneios ficam disponíveis assim que eles entram no status “O que vem por aí”. Já os
                palpites podem ser enviados a partir da publicação da chave no TennisPool até o horário de início da
                primeira partida da chave principal.
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
                Você ganha pontos a cada acerto de vencedor. A pontuação é progressiva: rodadas finais valem mais. A
                última partida (Final) premia exclusivamente quem acerta o Campeão do torneio.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Chaveamento e Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                Escolha quem avança em cada fase do torneio, palpitando no chaveamento até a partida final e conquiste
                pontos progressivos para se destacar no Ranking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
              <CardTitle className="text-lg">Ver Adversários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                Para visualizar os palpites dos adversários, basta clicar em “Ranking” e depois em “Ranking por
                Torneio” e em seguida, no adversário de sua escolha.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 md:p-8 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-amber-900 font-black text-lg mb-1 uppercase tracking-tight">Observação Importante</h3>
              <p className="text-amber-800 font-medium leading-relaxed">
                Sempre que um tenista com o status de Lucky Loser(LL) vencer uma partida, ou em caso de vitória por W/O
                (Walkover), não haverá pontuação.
              </p>
            </div>
          </div>
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
                <Card key={cat.id} className="border-0 shadow-md overflow-hidden pt-0">
                  <div className="bg-slate-900 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-slate-400 text-xs">{cat.description}</p>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {config.rounds.map((points, idx) => {
                        const isCampeao = idx === config.rounds.length - 1;
                        const isFinal = idx === config.rounds.length - 2;
                        const roundName = getRoundName(idx + 1, config.rounds.length - 1);

                        let displayTitle = roundName;
                        if (isCampeao) displayTitle = 'Campeão';
                        if (isFinal) displayTitle = 'Final';

                        return (
                          <React.Fragment key={idx}>
                            <div className="text-center border-1 border-slate-200 rounded-lg mx-2 py-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{displayTitle}</p>
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

        {/* Ranking Geral */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Regras do Ranking Geral</h2>
          </div>

          <div>
            <p className="text-slate-600 mb-3">
              O Ranking Geral será composto por <span className="font-bold text-slate-900">29 torneios oficiais</span>, distribuídos da seguinte forma:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium ml-2">
              <li>4 Grand Slams</li>
              <li>9 Masters 1000</li>
              <li>16 ATPs 500</li>
            </ul>
            <p className="text-slate-600 mt-3">
              Totalizando <span className="font-bold text-slate-900">29 torneios válidos para pontuação</span>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Sistema de Pontuação</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
              <li>Em cada torneio disputado, o participante acumulará pontos de acordo com seu desempenho.</li>
              <li>O ranking geral será calculado com base nas <span className="font-bold text-slate-900">22 melhores pontuações</span> obtidas entre os 29 torneios disponíveis.</li>
              <li>A contagem dos pontos seguirá o sistema de <span className="font-bold text-slate-900">52 semanas (12 meses corridos)</span>.</li>
              <li>O ranking geral será atualizado somente ao término de cada torneio.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Validade dos Pontos</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
              <li>Toda pontuação conquistada em um torneio terá validade de <span className="font-bold text-slate-900">52 semanas</span> a partir da data da competição.</li>
              <li>Após este período, os pontos referentes ao torneio serão automaticamente zerados e deixarão de contar para o ranking.</li>
              <li>O sistema atualizará continuamente o ranking, sempre considerando as <span className="font-bold text-slate-900">22 maiores pontuações válidas</span> dentro do período vigente.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
