import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Icon, MapPin, Users, Zap } from 'lucide-react';
import type { Tournament } from '@/lib/data';
import { PageHero } from '../shared/page-hero';
import { Card, CardContent } from '../ui/card';
import { tennisBall } from '@lucide/lab';
import { getCategory } from '@/lib/utils';
import {
  surfaceColors,
  surfaceLabels,
  surfaceImages,
  getTournamentImage,
  getTournamentStatus,
} from '@/lib/tournament';

interface TournamentHeaderProps {
  tournament: Tournament;
  participants?: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

export function TournamentHeader({ tournament, participants = 0 }: TournamentHeaderProps) {
  const { label: statusLabel, color: statusColor } = getTournamentStatus(tournament);
  const bgImage = getTournamentImage(tournament);

  return (
    <PageHero
      title={tournament.name}
      subtitle={
        tournament.location +
        `\n${formatDate(tournament.start_date)} - ${formatDate(tournament.end_date)}` +
        `\n Início às ${new Date(tournament.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` +
        `\n${surfaceLabels[tournament.surface] || tournament.surface}`
      }
      bgImage={bgImage}
    >
      <div className="flex items-center gap-4">
        <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
          <CardContent className="p-4 block items-center">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Icon iconNode={tennisBall} className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Categoria</p>
                <p className="text-xl md:text-2xl font-black text-white">{getCategory(tournament.category)}</p>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-100/70 text-xs font-bold uppercase tracking-wider">Inscritos</p>
                <p className="text-xl md:text-2xl font-black text-white">{participants}</p>
              </div>{' '}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageHero>
  );
}
