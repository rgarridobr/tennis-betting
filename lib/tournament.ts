import type { Tournament } from '@/lib/data';

// --- Surface constants ---

export const surfaceColors: Record<string, string> = {
  Hard: 'bg-blue-500/90 text-white',
  Clay: 'bg-orange-500/90 text-white',
  Grass: 'bg-emerald-600/90 text-white',
};

/** Canonical surface keys — translate with `useTranslations('surfaces')`. */
export const surfaceLabels: Record<string, string> = {
  Hard: 'Hard',
  Clay: 'Clay',
  Grass: 'Grass',
};

/** Map legacy PT DB values → canonical surface keys for i18n. */
export function normalizeSurfaceKey(surface: string): 'Hard' | 'Clay' | 'Grass' | string {
  const map: Record<string, 'Hard' | 'Clay' | 'Grass'> = {
    Hard: 'Hard',
    Clay: 'Clay',
    Grass: 'Grass',
    Saibro: 'Clay',
    Grama: 'Grass',
    'Quadra dura': 'Hard',
    'Quadra Dura': 'Hard',
    'Hard Court': 'Hard',
  };
  return map[surface] ?? surface;
}

export type TournamentStatusKey =
  | 'finished'
  | 'open'
  | 'scheduled'
  | 'inProgress'
  | 'preparingBracket'
  | 'upcoming';

export const surfaceImages: Record<string, string> = {
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
  Grass: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
  Hard: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
};

// --- Tournament image mapping ---

const tournamentImageMap: { keyword: string; image: string }[] = [
  { keyword: 'australian open', image: '/tournaments/australian-open.webp' },
  { keyword: 'nexo dallas open', image: '/tournaments/dallas-open.webp' },
  { keyword: 'abn amro open', image: '/tournaments/rotterdam-open.webp' },
  { keyword: 'qatar exxonmobil open', image: '/tournaments/qatar-open.webp' },
  { keyword: 'rio open presented by claro', image: '/tournaments/rio-open.webp' },
  { keyword: 'dubai tennis championships', image: '/tournaments/dubai-duty.webp' },
  { keyword: 'abierto mexicano telcel', image: '/tournaments/acapulco-hsbc.webp' },
  { keyword: 'miami open presented by itau', image: '/tournaments/miami-open.webp' },
  { keyword: 'rolex monte-carlo masters', image: '/tournaments/monte-carlo-masters.webp' },
  { keyword: 'barcelona open banc sabadell', image: '/tournaments/barcelona-open.webp' },
  { keyword: 'bmw open by bitpanda', image: '/tournaments/munich-open.webp' },
  { keyword: 'mutua madrid open', image: '/tournaments/madrid-open.webp' },
  { keyword: "internazionali bnl d'italia", image: '/tournaments/bnl-roma.webp' },
  { keyword: 'roland garros', image: '/tournaments/roland-garros.webp' },
  { keyword: 'bitpanda hamburg open', image: '/tournaments/hamburg-open.webp' },
  { keyword: 'terra wortmann open', image: '/tournaments/wortmann-open.webp' },
  { keyword: 'hsbc championships', image: '/tournaments/hsbc.webp' },
  { keyword: 'wimbledon', image: '/tournaments/wimbledon.webp' },
  { keyword: 'mubadala citi dc open', image: '/tournaments/mubadala-open.webp' },
  { keyword: 'national bank open presented by rogers', image: '/tournaments/national-bank-open.webp' },
  { keyword: 'cincinnati open', image: '/tournaments/masters-1000-cincinnati.webp' },
  { keyword: 'us open', image: '/tournaments/us-open.webp' },
  { keyword: 'china open', image: '/tournaments/china-open.webp' },
  { keyword: 'kinoshita group japan open tennis championships', image: '/tournaments/kinoshita-open.webp' },
  { keyword: 'rolex shanghai masters', image: '/tournaments/shanghai-masters.webp' },
  { keyword: 'swiss indoors basel', image: '/tournaments/swiss-basel.webp' },
  { keyword: 'erste bank open', image: '/tournaments/viena-open.webp' },
  { keyword: 'rolex paris masters', image: '/tournaments/paris-masters.webp' },
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
  /** Message key under `status.*` — translate in the UI layer */
  statusKey: TournamentStatusKey;
  /** @deprecated Prefer translating `statusKey`. Kept for legacy callers. */
  label: string;
  color: string;
  isFinished: boolean;
  isLockedByDate: boolean;
  pulseEffect: boolean;
}

const STATUS_FALLBACK_LABELS: Record<TournamentStatusKey, string> = {
  finished: 'Finalizado',
  open: 'Aberto para palpites',
  scheduled: 'Agendado',
  inProgress: 'Em andamento',
  preparingBracket: 'Preparando chaveamento',
  upcoming: 'Em breve',
};

export function getTournamentStatus(tournament: Pick<Tournament, 'status' | 'start_date'>): TournamentStatus {
  const isLockedByDate = new Date(tournament.start_date) <= new Date();

  const isFinished =
    tournament.status === 'finished' || tournament.status === 'FINISHED' || tournament.status === 'completed';

  const isOpen = tournament.status === 'active' || tournament.status === 'OPEN';

  let statusKey: TournamentStatusKey;
  let color: string;

  if (isFinished) {
    statusKey = 'finished';
    color = 'bg-slate-600/95 text-white border-slate-500/50';
  } else if (isOpen) {
    statusKey = 'open';
    color = 'bg-emerald-600/95 text-white border-emerald-500/50';
  } else if (tournament.status === 'STANDBY') {
    statusKey = 'scheduled';
    color = 'bg-amber-500/95 text-white border-amber-400/50';
  } else if (isLockedByDate) {
    statusKey = 'inProgress';
    color = 'bg-blue-600/95 text-white border-blue-500/50';
  } else if (tournament.status === 'UPCOMING') {
    statusKey = 'preparingBracket';
    color = 'bg-purple-600/95 text-white border-purple-500/50';
  } else {
    statusKey = 'upcoming';
    color = 'bg-purple-600/95 text-white border-purple-500/50';
  }

  const pulseEffect = (isLockedByDate && !isFinished) || isOpen;

  return {
    statusKey,
    label: STATUS_FALLBACK_LABELS[statusKey],
    color,
    isFinished,
    isLockedByDate,
    pulseEffect,
  };
}
