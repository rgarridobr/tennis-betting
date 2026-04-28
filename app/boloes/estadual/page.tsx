import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  getStateRanking, 
  getStateMemberCount,
  getActiveTournament,
  getTournamentsWithBrackets
} from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { PoolRanking } from "@/components/pools/pool-ranking";
import { Users, Shield, Trophy, MapPin } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TournamentFilter } from "@/components/pools/tournament-filter";

export default async function StatePoolPage({ searchParams }: { searchParams: Promise<{ tournamentId?: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  // Se o usuário não tiver estado, redireciona para a página de bolões
  if (!user.state) redirect("/boloes");

  const { tournamentId } = await searchParams;
  const selectedTournamentId = tournamentId ? parseInt(tournamentId, 10) : undefined;

  const [memberCount, activeTournament, tournaments] = await Promise.all([
    getStateMemberCount(user.state),
    getActiveTournament(),
    getTournamentsWithBrackets()
  ]);

  const ranking = await getStateRanking(user.state, selectedTournamentId);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title={`Bolão Estadual - ${user.state}`}
        subtitle={`Ranking exclusivo para jogadores do estado ${user.state}`}
      >
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="text-white font-bold">{memberCount} participantes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span className="text-white font-bold">Bolão Regional</span>
          </div>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-12">
        <div className="mb-8">
          <Link 
            href="/boloes" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para Bolões
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" />
              Ranking do Estado ({user.state})
            </h2>
            <TournamentFilter tournaments={tournaments} currentTournamentId={selectedTournamentId} />
          </div>

          <PoolRanking ranking={ranking} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
