import { notFound } from 'next/navigation';
import { getTournamentById, getBracketMatches, getPlayers, getTournamentRanking } from '@/lib/data';
import { getDynamicRoundNames } from '@/lib/utils';
import { isRound1Complete } from '@/lib/admin';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerManager } from '@/components/admin/player-manager';
import { SyncTournamentBracketButton } from '@/components/admin/sync-tournament-bracket-button';
import { PublishBracketButton } from '@/components/admin/publish-bracket-button';
import { TournamentStatusTransition } from '@/components/admin/tournament-status-transition';
import { TournamentBracket } from '@/components/tournament/tournament-bracket';
import { Trophy, Clock, Hash, Users, ArrowLeft, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { EditTournamentDateModal } from '@/components/admin/edit-tournament-date-modal';
import { TournamentPodium } from '@/components/tournament/tournament-podium';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}

export default async function ManageTournamentPage({ params }: Props) {
  const { id } = await params;

  if (id === 'novo') return null;

  const tournamentId = parseInt(id, 10);
  if (isNaN(tournamentId)) notFound();

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) notFound();

  const [matches, players, round1Complete, ranking] = await Promise.all([
    getBracketMatches(tournamentId),
    getPlayers(),
    isRound1Complete(tournamentId),
    getTournamentRanking(tournamentId, 3),
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

  const statusLabels: Record<string, string> = {
    STANDBY: 'Standby',
    draft: 'Rascunho',
    UPCOMING: 'Em breve',
    OPEN: 'Aberto para palpites',
    LOCKED: 'Apostas Fechadas',
    IN_PROGRESS: 'Em andamento',
    FINISHED: 'Finalizado',
    published: 'Publicado',
    finished: 'Finalizado',
    upcoming: 'Em breve',
    active: 'Ativo',
    completed: 'Finalizado',
  };

  const surfaceLabels: Record<string, string> = {
    Hard: 'Quadra Dura',
    Saibro: 'Saibro',
    Grama: 'Grama',
    Clay: 'Saibro',
    Grass: 'Grama',
  };

  function parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  return (
    <>
      <PageHero
        title={tournament.name}
        subtitle={`${tournament.location} \u2022 ${format(parseDate(tournament.start_date), 'dd/MM/yyyy - HH:mm', { locale: ptBR })} \u2022 ${surfaceLabels[tournament.surface] || tournament.surface}`}
      >
        <div className="grid grid-cols-1 gap-4">
          <EditTournamentDateModal tournamentId={tournamentId} currentDate={new Date(tournament.start_date)} hasFinished={tournament.status === 'finished'}/>
        </div>
      </PageHero>
      <main className="container mx-auto px-4 md:px-32 py-8">
        {/* Status e Voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Button variant="outline" size="sm" asChild className="bg-transparent w-fit">
            <Link href="/admin/torneios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
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
              {statusLabels[tournament.status] || tournament.status}
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
                    ? 'Modo Em Breve'
                    : 'Modo Standby'}
                </h3>
                <p className="text-sm font-bold opacity-80">
                  {tournament.status === 'UPCOMING' || tournament.status === 'upcoming'
                    ? 'O chaveamento está sendo definido. Publique para permitir resultados e palpites.'
                    : 'O torneio está interno (apenas admin vê). Clique em "Preparar Chaveamento" para gerar a chave e torná-lo visível.'}
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chaveamento</h2>
            {(tournament.status === 'STANDBY' || 
              tournament.status === 'upcoming' || 
              tournament.status === 'UPCOMING' || 
              tournament.status === 'draft' || 
              tournament.status === 'OPEN') && (
              <SyncTournamentBracketButton tournamentId={tournamentId} isReady={matches.length > 0} />
            )}
              {tournament.status !== 'draft' && (
                <Badge className="bg-emerald-600 text-white font-black px-4 py-1.5 rounded-full">CHAVE FIXA</Badge>
              )}
            </div>
          </div>

          {matches.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500 font-medium">O chaveamento ainda não foi gerado.</p>
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
