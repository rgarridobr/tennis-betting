import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Icon, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Tournament } from '@/lib/data';
import { tennisBall } from '@lucide/lab';

interface TournamentCardProps {
  tournament: Tournament;
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
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
  Grass: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80',
  Hard: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function TournamentCard({ tournament }: TournamentCardProps) {
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

  const imageUrl = tournament.image_url || surfaceImages[tournament.surface] || surfaceImages.Hard;

  const getCategory = (category: string) => {
    switch (category) {
      case 'GRAND_SLAM':
        return 'Grand Slam';
      case 'MASTERS_1000':
        return 'Masters 1000';
      case 'ATP_500':
        return 'ATP 500';
      case 'ATP_250':
        return 'ATP 250';
      default:
        return category;
    }
  };

  return (
    <Link href={`/torneio/${tournament.id}`}>
      <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 pt-0 rounded-[2rem]">
        <div className="relative h-60">
          <img src={imageUrl || '/placeholder.svg'} alt={tournament.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <Badge
            className={`absolute top-4 right-4 ${statusColor} px-3 py-1 text-[10px] uppercase tracking-wider font-bold shadow-lg`}
          >
            {statusLabel}
          </Badge>
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-black text-white text-xl drop-shadow-lg leading-tight">{tournament.name}</h3>
            <Badge
              className={`mt-2 ${surfaceColors[tournament.surface] || 'bg-slate-500 text-white'} border-none font-bold px-3`}
            >
              {surfaceLabels[tournament.surface] || tournament.surface}
            </Badge>
          </div>
        </div>
        <CardContent className="px-6 py-5 bg-white">
          <div className="flex flex-col gap-2 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <Icon iconNode={tennisBall} className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{getCategory(tournament.category)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>
                {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{tournament.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
