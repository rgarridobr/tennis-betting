import type { Tournament } from '@/lib/data';

// --- Surface constants ---

export const surfaceColors: Record<string, string> = {
  Hard: 'bg-blue-500/90 text-white',
  Clay: 'bg-orange-500/90 text-white',
  Grass: 'bg-emerald-600/90 text-white',
};

export const surfaceLabels: Record<string, string> = {
  Hard: 'Hard Court',
  Clay: 'Saibro',
  Grass: 'Grama',
};

export const surfaceImages: Record<string, string> = {
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
  Grass: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
  Hard: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
};

// --- Tournament image mapping ---

const tournamentImageMap: { keyword: string; image: string }[] = [
  { keyword: 'roland garros', image: '/tournaments/roland-garros.webp' },
  { keyword: 'wimbledon', image: '/tournaments/wimbledon.webp' },
  { keyword: 'us open', image: '/tournaments/us-open.webp' },
  { keyword: 'hamburg open', image: '/tournaments/hamburg-open.webp' },
  { keyword: 'australian open', image: '/tournaments/australian-open.webp' },
  { keyword: 'dallas open', image: '/tournaments/dallas-open.webp' },
  { keyword: 'qatar', image: '/tournaments/qatar-open.webp' },
  { keyword: 'rio open', image: '/tournaments/rio-open.webp' },
  { keyword: 'amro open', image: '/tournaments/rotterdam-open.webp' },
  { keyword: 'hsbc championships', image: '/tournaments/hsbc.webp' },
  { keyword: 'wortmann open', image: '/tournaments/wortmann-open.webp' },
  { keyword: 'mubadala citi', image: '/tournaments/mubadala-open.webp' },
  { keyword: 'national bank', image: '/tournaments/national-bank-open.webp' },
  { keyword: 'cincinnati open', image: '/tournaments/masters-1000-cincinnati.webp' },
  { keyword: 'kinoshita', image: '/tournaments/kinoshita-open.webp' },
];

/**
 * Returns the best image URL for a tournament based on its name, custom image, or surface.
 */
export function getTournamentImage(tournament: Pick<Tournament, 'name' | 'image_url' | 'surface'>): string {
  const nameLower = tournament.name.toLowerCase();

  const match = tournamentImageMap.find((entry) => nameLower.includes(entry.keyword));
  if (match) return match.image;

  return tournament.image_url || surfaceImages[tournament.surface] || surfaceImages.Hard;
}

// --- Tournament status helpers ---

export interface TournamentStatus {
  label: string;
  color: string;
  isFinished: boolean;
  isLockedByDate: boolean;
  pulseEffect: boolean;
}

export function getTournamentStatus(tournament: Pick<Tournament, 'status' | 'start_date'>): TournamentStatus {
  const isLockedByDate = new Date(tournament.start_date) <= new Date();

  const isFinished =
    tournament.status === 'finished' ||
    tournament.status === 'FINISHED' ||
    tournament.status === 'completed';

  const isOpen = tournament.status === 'active' || tournament.status === 'OPEN';

  let label: string;
  let color: string;

  if (isFinished) {
    label = 'Finalizado';
    color = 'bg-slate-600/95 text-white border-slate-500/50';
  } else if (isOpen) {
    label = 'Aberto para palpites';
    color = 'bg-emerald-600/95 text-white border-emerald-500/50';
  } else if (isLockedByDate) {
    label = 'Em andamento';
    color = 'bg-blue-600/95 text-white border-blue-500/50';
  } else if (tournament.status === 'STANDBY') {
    label = 'Agendado';
    color = 'bg-amber-500/95 text-white border-amber-400/50';
  } else if (tournament.status === 'UPCOMING') {
    label = 'Preparando chaveamento';
    color = 'bg-purple-600/95 text-white border-purple-500/50';
  } else {
    label = 'Em breve';
    color = 'bg-purple-600/95 text-white border-purple-500/50';
  }

  const pulseEffect = (isLockedByDate && !isFinished) || isOpen;

  return { label, color, isFinished, isLockedByDate, pulseEffect };
}
