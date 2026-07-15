import { getTournaments } from '@/lib/data';
import { getAllUsers, getAdminStats } from '@/lib/admin';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Trophy,
  TrendingUp,
  Settings,
  Calendar,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getCategory, getStatusLabelKeys } from '@/lib/utils'
import { normalizeSurfaceKey } from '@/lib/tournament';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboardPage() {
  const [tournaments, users, adminStats] = await Promise.all([getTournaments(), getAllUsers(), getAdminStats()]);
  const t = await getTranslations('admin');
  const tStatus = await getTranslations('status');
  const tSurfaces = await getTranslations('surfaces');

  const activeTournaments = tournaments.filter(
    (tournament) =>
      tournament.status === 'active' ||
      tournament.status === 'published' ||
      tournament.status === 'OPEN' ||
      tournament.status === 'LOCKED' ||
      tournament.status === 'IN_PROGRESS',
  );

  const cards = [
    {
      label: t('statsActiveTournaments'),
      value: activeTournaments.length,
      icon: Trophy,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-600',
      highlightBg: 'bg-amber-50/50',
      highlightRing: 'ring-amber-100',
    },
    {
      label: t('statsNewUsers'),
      value: adminStats.newUsers7d,
      subtext: t('statsLast7Days'),
      icon: UserPlus,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-600',
      highlightBg: 'bg-emerald-50/50',
      highlightRing: 'ring-emerald-100',
    },
    {
      label: t('statsTotalPredictions'),
      value: adminStats.totalPredictions,
      subtext: t('statsSinceStart'),
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-600',
      highlightBg: 'bg-blue-50/50',
      highlightRing: 'ring-blue-100',
    },
  ];

  const statusClass: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    UPCOMING: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    OPEN: 'bg-emerald-100 text-emerald-700',
    published: 'bg-emerald-100 text-emerald-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    LOCKED: 'bg-orange-100 text-orange-700',
    completed: 'bg-slate-100 text-slate-600',
    finished: 'bg-slate-100 text-slate-600',
    FINISHED: 'bg-slate-100 text-slate-600',
    STANDBY: 'bg-slate-100 text-slate-500',
    draft: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHero
        title={t('dashboardTitle')}
        subtitle={t('dashboardSubtitle')}
      />

      <main className="container mx-auto px-4 md:px-32 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-12 relative z-10 py-2 px-4">
          {cards.map((card) => (
            <Card
              key={card.label}
              className={`border-0 shadow-lg rounded-[2rem] bg-white transition-all hover:shadow-xl duration-300`}
            >
              <CardContent className="p-2 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className={`text-2xl font-black ${card.valueColor}`}>{card.value}</p>
                    {card.subtext && <p className="text-[10px] font-bold text-slate-400 truncate">{card.subtext}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-12">
          {/* Recent Tournaments */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('recentTournaments')}</h2>
                </div>
                <Button
                  variant="ghost"
                  asChild
                  className="text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl px-4"
                >
                  <Link href="/admin/torneios" className="flex items-center gap-2">
                    {t('manageAll')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {tournaments.slice(0, 4).map((tournament) => {
                  const statusKey = getStatusLabelKeys[tournament.status] || 'upcoming';
                  const badgeClass = statusClass[tournament.status] || statusClass.upcoming;
                  const surfaceKey = normalizeSurfaceKey(tournament.surface);
                  const surfaceLabel =
                    surfaceKey === 'Hard' || surfaceKey === 'Clay' || surfaceKey === 'Grass'
                      ? tSurfaces(surfaceKey)
                      : tournament.surface;

                  return (
                    <Card
                      key={tournament.id}
                      className="border-0 shadow-lg rounded-[2.5rem] bg-white overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                    >
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <Badge
                            className={`${badgeClass} border-none font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full`}
                          >
                            {tStatus(statusKey)}
                          </Badge>
                          <Link
                            href={`/admin/torneios/${tournament.id}`}
                            className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                          </Link>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                          {tournament.name}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          {tournament.location} • {surfaceLabel}
                        </p>

                        <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-emerald-500" />
                          {getCategory(tournament.category)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Side Panels */}
          <div className="space-y-12">
            {/* Top Engagement */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('popularTournaments')}</h2>
              </div>
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {adminStats.topTournaments.map((tournament, i) => (
                      <div key={tournament.id} className="p-6 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors w-8">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors truncate max-w-[120px]">
                              {tournament.name}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                              {' '}
                              {tStatus(getStatusLabelKeys[tournament.status] || 'active')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">{tournament.participants}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('enrolled')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent Participants */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('participants')}</h2>
                </div>
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
                >
                  <Link href="/admin/usuarios">{t('viewAll')}</Link>
                </Button>
              </div>
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {users.slice(0, 6).map((u) => (
                    <div key={u.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform ${u.is_admin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate max-w-[140px]">{u.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {u.nickname || t('noNickname')}
                          </p>
                        </div>
                      </div>
                      {u.is_admin ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-wider px-2 py-0 h-5 border-slate-100"
                        >
                          {t('predictionsCount', { n: u.total_predictions })}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
