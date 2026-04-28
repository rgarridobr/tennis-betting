import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  getTournamentById,
  getBracketMatches,
  getUserPredictions,
  isUserEnrolled,
  getTournamentParticipantCount,
  getTournamentPlayers,
  hasTournamentStarted,
  getEnrollment,
  getTournamentRanking,
  getUserPublicInfo,
  getActiveTournament,
} from "@/lib/data";
import { getDynamicRoundNames } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TournamentHeader } from "@/components/tournament/tournament-header";
import { FileText, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { TournamentBracket } from "@/components/tournament/tournament-bracket";
import { EnrollmentBanner } from "@/components/tournament/enrollment-banner";
import { TournamentRanking } from "@/components/tournament/tournament-ranking";
import { TournamentPodium } from "@/components/tournament/tournament-podium";

interface TournamentPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; viewUser?: string }>;
}

export default async function TournamentPage({
  params,
  searchParams,
}: TournamentPageProps) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.is_admin) redirect("/admin");

  const { id } = await params;
  const { viewUser, view = "bracket" } = await searchParams;
  const tournamentId = parseInt(id, 10);
  if (isNaN(tournamentId)) notFound();

  const tournament = await getTournamentById(tournamentId);

  if (!tournament || !tournament.is_visible) notFound();

  const started = await hasTournamentStarted(tournamentId);
  const targetUserId = viewUser && started ? parseInt(viewUser, 10) : user.id;
  const isViewingOthers = targetUserId !== user.id;

  const [
    matches,
    targetPredictions,
    enrollment,
    participants,
    tournamentPlayers,
    targetUserInfo,
    activeTournament,
    ranking,
  ] = await Promise.all([
    getBracketMatches(tournamentId),
    getUserPredictions(targetUserId, tournamentId),
    getEnrollment(user.id, tournamentId),
    getTournamentParticipantCount(tournamentId),
    getTournamentPlayers(tournamentId),
    isViewingOthers ? getUserPublicInfo(targetUserId) : null,
    getActiveTournament(),
    getTournamentRanking(tournamentId, 3),
  ]);

  const isFinished =
    tournament.status === "finished" ||
    tournament.status === "FINISHED" ||
    tournament.status === "completed";

  const enrolled = !!enrollment;

  // Map: bracketMatchId -> prediction object
  const predictionsRecord: Record<
    number,
    { winnerId: number; score?: string }
  > = {};
  for (const p of targetPredictions) {
    predictionsRecord[p.bracket_match_id] = {
      winnerId: p.predicted_winner_id,
      score: p.predicted_score || undefined,
    };
  }

  const maxRound =
    matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const dynamicRoundNames = getDynamicRoundNames(maxRound);

  function subtractDays(date: string | Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
  }

  const twoDaysBefore = subtractDays(tournament.start_date, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <TournamentHeader tournament={tournament} participants={participants} />

      <main className="container mx-auto px-4 md:px-32 py-12">
        {!enrolled && !started && <EnrollmentBanner tournament={tournament} />}

        {ranking && ranking.length > 0 && !isViewingOthers && (
          <TournamentPodium ranking={ranking} isFinished={isFinished} />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isViewingOthers ? "Visualizando Chave" : "Chaveamento"}
              </h2>
              {enrolled && !started && !isViewingOthers && (
                <span className="text-sm text-emerald-600 font-bold">
                  Inscrito - Faça seus palpites!
                </span>
              )}
            </div>

            <Link
              href="/regras"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors pb-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Regras do Torneio
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isViewingOthers && (
              <Link
                href={
                  view === "ranking"
                    ? `/ranking/torneio/${tournamentId}`
                    : `/ranking`
                }
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Ranking
              </Link>
            )}
          </div>
        </div>

        {isViewingOthers && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-900 font-black text-lg leading-tight">
                  Você está visualizando os palpites de{" "}
                  <span className="text-blue-600">
                    {targetUserInfo?.name || "Usuário"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {tournament.status === "upcoming" ||
        tournament.status === "draft" ||
        tournament.status === "STANDBY" ||
        tournament.status === "UPCOMING" ||
        matches.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-6">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              {enrolled ? "Inscrição confirmada !" : "Você chegou cedo!"}
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-4">
              Aguardando divulgação do chaveamento por parte da ATP.
            </p>
            
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {participants} {participants === 1 ? "inscrito" : "inscritos"} no Torneio
            </div>

            <p className="text-slate-500 text-base font-medium max-w-2xl mx-auto mb-2">
              Volte aqui por volta de:
            </p>
            <p className="text-slate-500 text-lg font-bold max-w-2xl mx-auto capitalize">
              {twoDaysBefore.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : isViewingOthers && targetPredictions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-6">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Palpite do usuário não foi registrado
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              Este usuário não registrou palpites para este torneio.
            </p>
          </div>
        ) : (
          <TournamentBracket
            matches={matches}
            userId={user.id}
            tournamentId={tournamentId}
            predictions={predictionsRecord}
            canMakePredictions={enrolled && !started && !isViewingOthers}
            roundNames={dynamicRoundNames}
            hasStarted={started}
            tournamentStatus={tournament.status}
            tournamentCategory={tournament.category}
            isEnrolled={enrolled}
            isViewingOthers={isViewingOthers}
          />
        )}
      </main>
    </div>
  );
}
