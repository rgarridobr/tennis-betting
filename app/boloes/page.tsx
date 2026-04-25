import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPools, getGeneralPools, getPools, getActiveTournament, getStateMemberCount } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { PoolList } from "@/components/pools/pool-list";

interface PoolsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PoolsPage({ searchParams }: PoolsPageProps) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { q } = await searchParams;

  const [myPools, generalPools, searchResults, activeTournament] = await Promise.all([
    getUserPools(user.id),
    getGeneralPools(),
    q ? getPools(q) : Promise.resolve([]),
    getActiveTournament()
  ]);

  if (user.state) {
    const stateMemberCount = await getStateMemberCount(user.state);
    
    // Injecting dynamic state pool
    generalPools.unshift({
      id: "estadual",
      name: `Bolão Estadual - ${user.state}`,
      description: `Ranking exclusivo para os jogadores do estado ${user.state}`,
      creator_id: null,
      is_general: true,
      password_hash: null,
      created_at: new Date().toISOString(),
      member_count: stateMemberCount,
      is_member: true,
      is_state_pool: true
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title="Bolões"
        subtitle="Crie ou participe de grupos privados para competir com seus amigos."
      />

      <main className="container mx-auto px-4 md:px-32 py-12">
        <PoolList 
          myPools={myPools} 
          generalPools={generalPools} 
          initialSearchResults={searchResults}
        />
      </main>
    </div>
  );
}
