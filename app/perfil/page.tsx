import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserStats, getGlobalRanking, getActiveTournament, getTennisClubs } from '@/lib/data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Trophy, Target, TrendingUp, Medal, Shield } from 'lucide-react';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { ProfilePasswordForm } from '@/components/profile/profile-password-form';

export default async function PerfilPage() {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.is_admin) redirect('/admin');

  const [stats, ranking, activeTournament, clubs] = await Promise.all([
    getUserStats(user.id),
    getGlobalRanking(100),
    getActiveTournament(),
    getTennisClubs(),
  ]);

  // Find user position in ranking
  const userRankEntry = ranking.find((r) => r.user_id === user.id);
  const userPosition = userRankEntry?.rank || '-';

  // Calculate account age in whole days using local calendar dates
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const accountAge = Math.max(
    0,
    Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const displayName = user.nickname || user.name;
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero title="Meu Perfil" subtitle="Gerencie suas informações e veja suas estatísticas" />

      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* PROFILE CARD */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-slate-500">{user.email}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                {user.is_admin && (
                  <Badge className="bg-amber-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </Badge>
                )}

                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  {accountAge} dias de conta
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Posição no Ranking</p>
              <p className="text-3xl font-black text-emerald-600">#{userPosition}</p>
            </div>
          </CardContent>
        </Card>

        {/* SETTINGS */}
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-emerald-600" />
                Editar Perfil
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ProfileEditForm user={user} clubs={clubs} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-emerald-600" />
                Alterar Senha
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ProfilePasswordForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
