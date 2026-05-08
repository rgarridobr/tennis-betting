import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { 
  getPoolById, 
  getPoolRanking, 
  isUserPoolMember, 
  getActiveTournament,
  getTournamentsActive,
  getTournamentsWithBrackets,
  isUserEnrolled,
  getUserPredictions,
  hasTournamentStarted
} from "@/lib/data";
import { EnrollmentBanner } from "@/components/tournament/enrollment-banner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { PoolRanking } from "@/components/pools/pool-ranking";
import { PoolActions } from "@/components/pools/pool-actions";
import { TournamentFilter } from "@/components/pools/tournament-filter";
import { JoinPrivatePoolGate } from "@/components/pools/join-private-pool-gate";
import { Users, Shield, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PoolPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tournamentId?: string }>;
}

export default async function PoolPage({ params, searchParams }: PoolPageProps) {
  const { id } = await params;
  const poolId = parseInt(id, 10);
  if (isNaN(poolId)) notFound();

  const user = await getSession();
  if (!user) redirect(`/login?redirectTo=/boloes/${poolId}`);

  const pool = await getPoolById(poolId);
  if (!pool) notFound();

  const { tournamentId } = await searchParams;
  const selectedTournamentId = tournamentId ? parseInt(tournamentId, 10) : undefined;

  const [isMember, activeTournament, tournaments, ranking] = await Promise.all([
    isUserPoolMember(user.id, poolId),
    getActiveTournament(),
    pool.tournament_id ? getTournamentsActive() : getTournamentsWithBrackets(),
    getPoolRanking(poolId, selectedTournamentId)
  ]);

  if (!isMember && pool.password_hash && !user.is_admin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />
        <JoinPrivatePoolGate poolId={poolId} poolName={pool.name} />
      </div>
    );
  }

  let linkedTournament = null;
  let linkedTournamentName = null;
  let isEnrolled = false;
  let hasPredictions = false;
  let hasStarted = false;
  
  if (pool.tournament_id) {
    linkedTournament = tournaments.find(t => t.id === pool.tournament_id) || null;
    if (linkedTournament) linkedTournamentName = linkedTournament.name;
    
    const [enrolled, predictions, started] = await Promise.all([
      isUserEnrolled(user.id, pool.tournament_id),
      getUserPredictions(user.id, pool.tournament_id),
      hasTournamentStarted(pool.tournament_id)
    ]);
    
    isEnrolled = enrolled;
    hasPredictions = predictions.length > 0;
    hasStarted = started;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title={pool.name}
        subtitle={`${linkedTournamentName ? `🏆 Torneio: ${linkedTournamentName}\n` : ''}${pool.description || "Bolão para disputar com amigos"}`}
      >
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="text-white font-bold">{pool.member_count} participantes</span>
          </div>
 
          {pool.is_general && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-500/20">
              <Shield className="w-4 h-4 text-amber-300" />
              <span className="text-white font-bold">Bolão Oficial</span>
            </div>
          )}
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-12">
        <div className="flex flex-col gap-8">
          {linkedTournament && !isEnrolled && (
            <EnrollmentBanner tournament={linkedTournament} />
          )}

          {linkedTournament && isEnrolled && !hasPredictions && !hasStarted && (
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-3xl shadow-sm border">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Palpites Pendentes!</h3>
                    <p className="text-slate-600 mt-1 font-medium">
                      O torneio {linkedTournamentName} ainda não começou. Garanta seus pontos palpitando no chaveamento!
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 h-12 shadow-md hover:shadow-lg transition-all shrink-0 w-full sm:w-auto text-center"
                >
                  <Link href={`/torneios/${pool.tournament_id}`}>
                    Palpitar Agora
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" />
              Ranking do Bolão
            </h2>
            
            <div className="flex flex-wrap items-center gap-4">
              <PoolActions 
                pool={pool}
                tournaments={tournaments}
                isMember={isMember}
                isCreator={pool.creator_id === user.id}
              />
            </div>
          </div>

          <PoolRanking 
            ranking={ranking} 
            currentUserId={user.id} 
            initialHidePending={pool.hide_pending}
          />
        </div>
      </main>
    </div>
  );
}
