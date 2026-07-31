import { notFound } from 'next/navigation';
import {
  getTournamentById,
  getBracketMatches,
  getPlayers,
  getTournamentRanking,
  getTournamentParticipants,
} from '@/lib/data';
import { getDynamicRoundNames, getStatusLabelKeys } from '@/lib/utils'
import { normalizeSurfaceKey } from '@/lib/tournament';
import { isRound1Complete } from '@/lib/admin';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerManager } from '@/components/admin/player-manager';
import { SyncTournamentBracketButton } from '@/components/admin/sync-tournament-bracket-button';
import { ImportBracketPdfButton } from '@/components/admin/import-bracket-pdf-button';
import { PublishBracketButton } from '@/components/admin/publish-bracket-button';
import { TournamentStatusTransition } from '@/components/admin/tournament-status-transition';
import { TournamentBracket } from '@/components/tournament/tournament-bracket';
import { Clock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ptBR, enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import { EditTournamentDateModal } from '@/components/admin/edit-tournament-date-modal';
import { EditTournamentPrizeModal } from '@/components/admin/edit-tournament-prize-modal';
import { TournamentPodium } from '@/components/tournament/tournament-podium';
import { TournamentParticipantsDialog } from '@/components/admin/tournament-participants-dialog';
import { getLocale, getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}

export const maxDuration = 60;

export default async function ManageTournamentPage({ params }: Props) {
  const { id } = await params;

  if (id === 'novo') return null;

  const tournamentId = parseInt(id, 10);
  if (isNaN(tournamentId)) notFound();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) notFound();

  const t = await getTranslations('admin');
  const tStatus = await getTranslations('status');
  const tSurfaces = await getTranslations('surfaces');
  const tButtons = await getTranslations('buttons');
  const locale = await getLocale();
  const dateLocale = locale === 'en' ? enUS : ptBR;

  const [matches, players, round1Complete, ranking, participants] = await Promise.all([
    getBracketMatches(tournamentId),
    getPlayers(),
    isRound1Complete(tournamentId),
    getTournamentRanking(tournamentId, 3),
    getTournamentParticipants(tournamentId),
  ]);

  const isFinished = tournament.status === 'finished' || tournament.status === 'FINISHED' || tournament.status === 'completed';
  const assignedPlayerIds = new Set<number>();
  matches.forEach((m) => {
    if (m.player1_id) assignedPlayerIds.add(m.player1_id);
    if (m.player2_id) assignedPlayerIds.add(m.player2_id);
  });

  const maxRound = matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const finalMatch = matches.find((m) => m.round === maxRound);
  const finalCompleted = finalMatch?.status === 'completed' && !!finalMatch.winner_id;
  const dynamicRoundNames = getDynamicRoundNames(maxRound);

  function parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  const surfaceKey = normalizeSurfaceKey(tournament.surface);
  const surfaceLabel =
    surfaceKey === 'Hard' || surfaceKey === 'Clay' || surfaceKey === 'Grass'
      ? tSurfaces(surfaceKey)
      : tournament.surface;

  return (
    <>
      <PageHero
        title={tournament.name}
        subtitle={`${tournament.location} \u2022 ${format(parseDate(tournament.start_date), 'dd/MM/yyyy - HH:mm', { locale: dateLocale })} \u2022 ${surfaceLabel}`}
      >
        <div className="grid grid-cols-1 gap-4">
          <EditTournamentDateModal tournamentId={tournamentId} currentDate={new Date(tournament.start_date)} hasFinished={tournament.status === 'finished'}/>
          <EditTournamentPrizeModal
            tournamentId={tournamentId}
            initialPrizeDescription={tournament.prize_description}
          />
        </div>
      </PageHero>
      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* Status e Voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Button variant="outline" size="sm" asChild className="bg-transparent w-fit">
            <Link href="/admin/torneios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tButtons('back')}
            </Link>
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
            <TournamentParticipantsDialog participants={participants} />

            <TournamentStatusTransition
              tournamentId={tournamentId}
              status={tournament.status}
              finalCompleted={finalCompleted}
            />

            <Badge
              className={
                tournament.status === 'active' || tournament.status === 'OPEN'
                  ? 'bg-emerald-100 text-emerald-700'
                  : tournament.status === 'upcoming' || tournament.status === 'UPCOMING'
                    ? 'bg-amber-100 text-amber-700'
                    : tournament.status === 'IN_PROGRESS' || tournament.status === 'LOCKED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
              }
            >
              {tStatus(getStatusLabelKeys[tournament.status] || 'active')}
            </Badge>
          </div>
        </div>

        {/* Podium / Winners */}
        {ranking.length > 0 && (tournament.status === 'IN_PROGRESS' || tournament.status === 'FINISHED') && <TournamentPodium ranking={ranking} isFinished={isFinished} />}

        {/* Gerenciar Jogadores */}
        <div className="mb-8">
          <PlayerManager players={players} />
        </div>

        {/* Alerta de Rascunho ou Standby */}
        {(tournament.status === 'STANDBY' ||
          tournament.status === 'UPCOMING' ||
          tournament.status === 'draft' ||
          tournament.status === 'upcoming') && (
          <div
            className={`mb-8 p-6 border-2 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 ${
              tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-4 ${tournament.status === 'UPCOMING' || tournament.status === 'upcoming' ? 'text-amber-800' : 'text-slate-700'}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  tournament.status === 'UPCOMING' || tournament.status === 'upcoming' ? 'bg-amber-100' : 'bg-slate-200'
                }`}
              >
                {tournament.status === 'UPCOMING' || tournament.status === 'upcoming' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-black text-lg">
                  {tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                    ? t('modeUpcoming')
                    : t('modeStandby')}
                </h3>
                <p className="text-sm font-bold opacity-80">
                  {tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                    ? t('alertUpcoming')
                    : t('alertStandby')}
                </p>
              </div>
            </div>
            {(tournament.status === 'UPCOMING' || tournament.status === 'upcoming') && (
              <PublishBracketButton tournamentId={tournamentId} isReady={round1Complete} />
            )}
          </div>
        )}

        {/* Rodadas do Chaveamento */}
        <div className="space-y-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('bracket')}</h2>
            {(tournament.status === 'STANDBY' || 
              tournament.status === 'upcoming' || 
              tournament.status === 'UPCOMING' || 
              tournament.status === 'draft' || 
              tournament.status === 'OPEN') && (
              <>
                <SyncTournamentBracketButton tournamentId={tournamentId} isReady={matches.length > 0} />
                <ImportBracketPdfButton tournamentId={tournamentId} isReady={matches.length > 0} />
              </>
            )}
              {tournament.status !== 'draft' && (
                <Badge className="bg-emerald-600 text-white font-black px-4 py-1.5 rounded-full">{t('fixedBracket')}</Badge>
              )}
            </div>
          </div>

          {matches.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500 font-medium">{t('noBracket')}</p>
              </CardContent>
            </Card>
          ) : (
            <TournamentBracket
              matches={matches}
              userId={0}
              tournamentId={tournamentId}
              predictions={{}}
              canMakePredictions={false}
              roundNames={dynamicRoundNames}
              isAdmin={true}
              players={players}
              tournamentStatus={tournament.status}
              assignedPlayerIds={Array.from(assignedPlayerIds)}
            />
          )}
        </div>
      </main>
    </>
  );
}
