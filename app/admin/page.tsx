import { getTournaments } from '@/lib/data';
import { getAllUsers } from '@/lib/admin';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, Users, Calendar, TrendingUp, Plus, Settings, ChevronRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [tournaments, users] = await Promise.all([getTournaments(), getAllUsers()]);

  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const totalPredictions = users.reduce((sum, u) => sum + Number(u.total_predictions), 0);

  return (
    <>
      <PageHero title="Painel Administrativo" subtitle="Gerencie torneios, jogadores e participantes do bolao">
        <div className="items-center gap-3 grid grid-cols-1 lg:flex">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl shrink-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 flex items-center justify-center border border-emerald-500/30">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Torneios</p>
                <p className="text-2xl font-black text-white">{tournaments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl shrink-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Users className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Usuários</p>
                <p className="text-2xl font-black text-white">{users.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-2">
          {[
            {
              label: 'Torneios',
              value: tournaments.length,
              icon: Trophy,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Ativos',
              value: activeTournaments.length,
              icon: Calendar,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            { label: 'Usuarios', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            {
              label: 'Palpites',
              value: totalPredictions,
              icon: TrendingUp,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Torneios Recentes */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md overflow-hidden pt-0">
              <div className="bg-slate-100 px-6 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Torneios Recentes
                </h2>
                <Button variant="outline" size="sm" asChild className="bg-transparent">
                  <Link href="/admin/torneios">Ver todos</Link>
                </Button>
              </div>
              <CardContent className="p-0">
                {tournaments.length === 0 ? (
                  <div className="py-12 text-center">
                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">Nenhum torneio cadastrado</p>
                    <Button asChild>
                      <Link href="/admin/torneios/novo">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Torneio
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {tournaments.slice(0, 5).map((t) => {
                      const statusConfig: Record<string, { label: string; class: string }> = {
                        upcoming: { label: 'Em breve', class: 'bg-amber-100 text-amber-700' },
                        active: { label: 'Ativo', class: 'bg-emerald-100 text-emerald-700' },
                        completed: { label: 'Finalizado', class: 'bg-slate-100 text-slate-600' },
                      };
                      const status = statusConfig[t.status] || statusConfig.upcoming;

                      return (
                        <Link
                          key={t.id}
                          href={`/admin/torneios/${t.id}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{t.name}</p>
                              <p className="text-xs text-slate-500">
                                {t.location} - {t.surface}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={status.class}>{status.label}</Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usuarios Recentes */}
          <div>
            <Card className="border-0 shadow-md overflow-hidden pt-0">
              <div className="bg-slate-100 px-6 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participantes
                </h2>
                <Button variant="outline" size="sm" asChild className="bg-transparent">
                  <Link href="/admin/usuarios">Ver todos</Link>
                </Button>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {users.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      {u.is_admin && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Admin</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
