import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  getPoolById,
  getPoolRanking,
  isUserPoolMember,
  getActiveTournament
} from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { PoolRanking } from "@/components/pools/pool-ranking";
import { PoolActions } from "@/components/pools/pool-actions";
import { Users, Shield, Trophy } from "lucide-react";

interface PoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function PoolPage({ params }: PoolPageProps) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;
  const poolId = parseInt(id, 10);
  if (isNaN(poolId)) notFound();

  const [pool, isMember, activeTournament] = await Promise.all([
    getPoolById(poolId),
    isUserPoolMember(user.id, poolId),
    getActiveTournament()
  ]);

  if (!pool) notFound();

  const ranking = await getPoolRanking(poolId);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title={pool.name}
        subtitle={pool.description || "Bolão para disputar com amigos"}
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

      <main className="container mx-auto px-4 md:px-32 -mt-8 pb-20">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" />
              Ranking do Bolão
            </h2>

            <PoolActions
              poolId={pool.id}
              poolName={pool.name}
              isMember={isMember}
              needsPassword={!!pool.password_hash}
            />
          </div>

          <PoolRanking ranking={ranking} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
