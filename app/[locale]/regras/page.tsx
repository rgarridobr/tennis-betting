import { requireUserWithLocation } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { POINTS_VARIANTS, getActiveTournament } from '@/lib/data';
import { getRoundName } from '@/lib/utils';
import { HelpCircle, Trophy, Clock, Edit3, Target, AlertTriangle, Users, Award } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react';
import { getTranslations } from 'next-intl/server';

export default async function RulesPage() {
  const user = await requireUserWithLocation();

  if (user.is_admin) {
    redirect('/admin');
  }

  const t = await getTranslations('rules');
  const [activeTournament] = await Promise.all([getActiveTournament()]);

  const categories = POINTS_VARIANTS;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title={t('title')} subtitle={t('subtitle')} />

      <main className="container mx-auto px-4 md:px-32 py-8 space-y-8">
        {/* General Rules */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">{t('deadlinesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('deadlinesBody')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{t('editTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('editBody')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <CardTitle className="text-lg">{t('scoringTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('scoringBody')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">{t('bracketTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('bracketBody')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
              <CardTitle className="text-lg">{t('viewOthersTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('viewOthersBody')}
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
              <h3 className="text-amber-900 font-black text-lg mb-1 uppercase tracking-tight">{t('importantTitle')}</h3>
              <p className="text-amber-800 font-medium leading-relaxed">
                {t('importantBody')}
              </p>
            </div>
          </div>
        </section>

        {/* Scoring Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('scoringSystem')}</h2>
          </div>

          <div className="grid gap-6">
            {categories.map((cat) => {
              const config = cat;
              return (
                <Card key={cat.id} className="border-0 shadow-md overflow-hidden pt-0">
                  <div className="bg-slate-900 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-slate-400 text-xs">{t(`categoryDescriptions.${cat.id}`)}</p>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                      {config.rounds.map((points, idx) => {
                        const isCampeao = idx === config.rounds.length - 1;
                        const isFinal = idx === config.rounds.length - 2;
                        const roundName = getRoundName(idx + 1, config.rounds.length - 1);

                        let displayTitle = roundName;
                        if (isCampeao) displayTitle = t('champion');
                        if (isFinal) displayTitle = t('final');

                        return (
                          <React.Fragment key={idx}>
                            <div className="text-center border-1 border-slate-200 rounded-lg mx-2 py-1">
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{displayTitle}</p>
                              <p className="text-xl font-black text-emerald-600 py-3">
                                {points === null ? '-' : points}
                              </p>
                              <p className="text-[10px] text-slate-500">{t('pointsUnit')}</p>
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
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('tiebreakTitle')}</h2>
          </div>
          <p className="text-slate-600 mb-4">
            {t('tiebreakIntro')}
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
            <li>{t('tiebreak1')}</li>
            <li>{t('tiebreak2')}</li>
            <li>{t('tiebreak3')}</li>
            <li>{t('tiebreak4')}</li>
          </ol>
        </section>

        {/* Ranking Geral */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('generalTitle')}</h2>
          </div>

          <div>
            <p className="text-slate-600 mb-3">
              {t.rich('generalComposed', {
                bold: (chunks) => <span className="font-bold text-slate-900">{chunks}</span>,
              })}
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium ml-2">
              <li>{t('generalSlam')}</li>
              <li>{t('generalMasters')}</li>
              <li>{t('generalAtp500')}</li>
            </ul>
            <p className="text-slate-600 mt-3">
              {t.rich('generalValid', {
                bold: (chunks) => <span className="font-bold text-slate-900">{chunks}</span>,
              })}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{t('generalScoringTitle')}</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
              <li>{t('generalScoring1')}</li>
              <li>{t('generalScoring2')}</li>
              <li>{t('generalScoring3')}</li>
              <li>{t('generalScoring4')}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{t('validityTitle')}</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-2">
              <li>{t('validity1')}</li>
              <li>{t('validity2')}</li>
              <li>{t('validity3')}</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
