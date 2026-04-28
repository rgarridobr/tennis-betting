import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPools, getGeneralPools, getPools, getActiveTournament, getStateMemberCount, getTournamentsActive } from "@/lib/data";
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

  const [myPools, generalPools, searchResults, activeTournament, tournaments] = await Promise.all([
    getUserPools(user.id),
    getGeneralPools(),
    q ? getPools(q) : Promise.resolve([]),
    getActiveTournament(),
    getTournamentsActive()
  ]);



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
          tournaments={tournaments}
          isAdmin={user.is_admin}
        />
      </main>
    </div>
  );
}
