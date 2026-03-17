import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, MapPin, ChevronRight, Award } from 'lucide-react';
import Link from 'next/link';
import type { Tournament } from '@/lib/data';
import Image from 'next/image';
import { getStatusLabels } from '@/lib/utils';

interface TournamentRankingCardProps {
  tournament: Tournament;
  href: string;
}

const categoryColors: Record<string, string> = {
  GRAND_SLAM: 'from-amber-500 to-yellow-600',
  MASTERS_1000: 'from-blue-600 to-indigo-700',
  ATP_500: 'from-emerald-500 to-teal-600',
  ATP_250: 'from-slate-500 to-slate-700',
};

const surfaceLabels: Record<string, string> = {
  Hard: 'Hard Court',
  Clay: 'Saibro',
  Grass: 'Grama',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function TournamentRankingCard({ tournament, href }: TournamentRankingCardProps) {

  const categoryGradient = categoryColors[tournament.category] || 'from-slate-500 to-slate-700';

  const getCategoryLabel = (category: string) => {
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
    <Link href={href}>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 rounded-[2rem] bg-white">
        <div
          className={`h-32 relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${categoryGradient}`}
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <Trophy className="w-32 h-32 rotate-12 text-white" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">
                {getCategoryLabel(tournament.category)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute inset-0 z-20 w-full h-full">
             <div className="absolute top-4 right-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none font-black text-[10px] uppercase tracking-wider">
                  {getStatusLabels[tournament.status]}
                </Badge>
              </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-emerald-600 transition-colors">
              {tournament.name}
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {tournament.location} •{' '}
              {surfaceLabels[tournament.surface] || tournament.surface}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-black text-sm group-hover:gap-2 transition-all">
              RANKING <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
