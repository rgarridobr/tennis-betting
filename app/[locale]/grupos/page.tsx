import { getSession } from "@/lib/auth";
import { getUserPools, getGeneralPools, getPools, getActiveTournament, getTournamentsActive } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { PoolList } from "@/components/pools/pool-list";
import { getTranslations } from "next-intl/server";

interface PoolsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PoolsPage({ searchParams }: PoolsPageProps) {
  const user = await getSession();
  const t = await getTranslations("pools");

  const { q } = await searchParams;

  const [myPools, generalPools, searchResults, activeTournament, tournaments] = await Promise.all([
    user ? getUserPools(user.id) : Promise.resolve([]),
    getGeneralPools(),
    q ? getPools(q) : Promise.resolve([]),
    getActiveTournament(),
    getTournamentsActive()
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
      />

      <main className="container mx-auto px-4 md:px-32 py-12">
        <PoolList 
          myPools={myPools} 
          generalPools={generalPools} 
          initialSearchResults={searchResults}
          tournaments={tournaments}
          isAdmin={user?.is_admin}
          isAuthenticated={!!user}
        />
      </main>
    </div>
  );
}
