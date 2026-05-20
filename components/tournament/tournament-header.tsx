import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Icon, MapPin, Users, Zap } from 'lucide-react';
import type { Tournament } from '@/lib/data';
import { PageHero } from '../shared/page-hero';
import { Card, CardContent } from '../ui/card';
import { tennisBall } from '@lucide/lab';
import { getCategory } from '@/lib/utils';

interface TournamentHeaderProps {
  tournament: Tournament;
  participants?: number;
}

const surfaceColors: Record<string, string> = {
  Hard: 'bg-blue-500 text-white',
  Clay: 'bg-orange-500 text-white',
  Grass: 'bg-emerald-600 text-white',
};

const surfaceLabels: Record<string, string> = {
  Hard: 'Hard Court',
  Clay: 'Saibro',
  Grass: 'Grama',
};

const surfaceImages: Record<string, string> = {
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
  Grass: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
  Hard: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

export function TournamentHeader({ tournament, participants = 0 }: TournamentHeaderProps) {
  const isLockedByDate = new Date(tournament.start_date) <= new Date();
  const isFinished =
    tournament.status === 'finished' || tournament.status === 'FINISHED' || tournament.status === 'completed';

  const statusLabel = isFinished
    ? 'Finalizado'
    : isLockedByDate
      ? 'Em Andamento'
      : tournament.status === 'active' || tournament.status === 'OPEN'
        ? 'Apostas Abertas'
        : 'Em breve';

  const statusColor = isFinished
    ? 'bg-slate-500 text-white border-none'
    : isLockedByDate
      ? 'bg-blue-500 text-white border-none'
      : tournament.status === 'active' || tournament.status === 'OPEN'
        ? 'bg-emerald-500 text-white border-none'
        : 'bg-amber-500 text-white border-none';

  const isRolandGarros = tournament.name.toLowerCase().includes('roland garros');
  const isWimbledon = tournament.name.toLowerCase().includes('wimbledon');
  const isUsOpen = tournament.name.toLowerCase().includes('us open');

  const bgImage = isRolandGarros
    ? 'https://images.unsplash.com/photo-1560014130-9ba41ce9bcef?w=1920&q=80'
    : isWimbledon
      ? 'https://worldtickets.hu/storage/2016/04/wimbledon-feature.jpg.webp?w=800&q=80'
      : isUsOpen
        ? 'https://images.unsplash.com/photo-1568663469495-b09d5e3c2e07?q=80'
        : surfaceImages[tournament.surface] || surfaceImages.Hard;

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
