import { requireUserWithLocation } from "@/lib/auth";
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
import { JoinPrivatePoolGate } from "@/components/pools/join-private-pool-gate";
import { Users, Shield, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

interface PoolPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tournamentId?: string }>;
}

export default async function PoolPage({ params, searchParams }: PoolPageProps) {
  const { id } = await params;
  const poolId = parseInt(id, 10);
  if (isNaN(poolId)) notFound();

  const user = await requireUserWithLocation(`/grupos/${poolId}`);
  const t = await getTranslations("pools");

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

  const subtitle = `${linkedTournamentName ? `🏆 ${t("tournamentLabel", { name: linkedTournamentName })}\n` : ""}${pool.description || t("defaultDescription")}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title={pool.name}
        subtitle={subtitle}
      >
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="text-white font-bold">{t("participantsCount", { count: pool.member_count })}</span>
          </div>
 
          {pool.is_general && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-500/20">
              <Shield className="w-4 h-4 text-amber-300" />
              <span className="text-white font-bold">{t("officialBadge")}</span>
            </div>
          )}

          {pool.whatsapp_link && (
            <a 
              href={pool.whatsapp_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-xl border border-emerald-400/20 text-white font-bold"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {t("whatsappLink")}
            </a>
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
                    <h3 className="font-bold text-lg text-slate-900">{t("pendingTitle")}</h3>
                    <p className="text-slate-600 mt-1 font-medium">
                      {t("pendingBody", { name: linkedTournamentName })}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 h-12 shadow-md hover:shadow-lg transition-all shrink-0 w-full sm:w-auto text-center"
                >
                  <Link href={`/torneios/${pool.tournament_id}`}>
                    {t("predictNow")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" />
              {t("rankingTitle")}
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
