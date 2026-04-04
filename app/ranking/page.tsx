import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getGlobalRanking,
  getUserStats,
  getActiveTournament,
} from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Crown, Medal, Award, Trophy } from "lucide-react";
import { TournamentPodium } from "@/components/tournament/tournament-podium";

export default async function RankingPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.is_admin) redirect("/admin");

  const [ranking, userStats, activeTournament] = await Promise.all([
    getGlobalRanking(100),
    getUserStats(user.id),
    getActiveTournament(),
  ]);

  // Find current user's position
  const userRankEntry = ranking.find((r) => r.user_id === user.id);
  const userPosition = userRankEntry?.rank || "-";

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      {/* Header */}
      <PageHero
        title="Ranking Geral"
        subtitle="Veja quem está liderando a temporada atual"
      />

      <main className="container mx-auto px-4 md:px-32 py-8">
        {ranking.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum participante ainda
              </h2>
              <p className="text-slate-600">
                Seja o primeiro a participar de um torneio!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {ranking.length >= 3 && (
              <div className="mx-auto">
                <TournamentPodium
                  ranking={ranking.slice(0, 3)}
                  title="Pódio Geral Ranking"
                />
              </div>
            )}

            {/* Rest of Rankings */}
            <Card className="border-0 shadow-lg overflow-hidden pt-0 bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-200/50">
              <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b flex justify-between items-center">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  Classificação Completa
                </h2>
                <Badge
                  variant="outline"
                  className="bg-white font-medium text-slate-500 border-slate-200"
                >
                  {ranking.length} participantes
                </Badge>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100/80">
                  {ranking.map((entry) => {
                    const isCurrentUser = user.id === entry.user_id;
                    const accuracy =
                      entry.total_predictions > 0
                        ? Math.round(
                            (entry.correct_predictions /
                              entry.total_predictions) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={entry.user_id}
                        className={`group flex items-center justify-between px-6 py-4 transition-all hover:bg-slate-50/80 ${
                          isCurrentUser
                            ? "bg-emerald-50/50 border-l-4 border-emerald-500 shadow-sm relative z-10"
                            : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          {/* Position */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shadow-sm transition-transform group-hover:scale-105 ${
                              entry.rank === 1
                                ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-amber-500/20"
                                : entry.rank === 2
                                  ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-slate-400/20"
                                  : entry.rank === 3
                                    ? "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-orange-500/20"
                                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                            }`}
                          >
                            {entry.rank}
                          </div>

                          {/* User Info */}
                          <div className="flex flex-col gap-1">
                            <p
                              className={`font-bold text-base flex items-center gap-2 ${isCurrentUser ? "text-emerald-800" : "text-slate-900"}`}
                            >
                              {entry.user_name}
                              {isCurrentUser && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 h-auto">
                                  Você
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                <Target className="w-3.5 h-3.5 text-slate-400" />
                                {entry.correct_predictions}/
                                {entry.total_predictions} acertos
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                <TrendingUp
                                  className={`w-3.5 h-3.5 ${accuracy >= 50 ? "text-emerald-500" : "text-slate-400"}`}
                                />
                                <span
                                  className={
                                    accuracy >= 50 ? "text-emerald-700" : ""
                                  }
                                >
                                  {accuracy}% precisão
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            Pontos
                          </span>
                          <p
                            className={`text-2xl font-black tabular-nums tracking-tight leading-none ${isCurrentUser ? "text-emerald-600" : "text-slate-900"}`}
                          >
                            {entry.total_points}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
