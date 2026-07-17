import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBrazilianPhoneNumber(value: string) {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  const length = digits.length;

  if (length <= 2) {
    return digits;
  }
  if (length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function getRoundName(round: number, maxRound: number): string {
  if (maxRound === 0) return `R${round}`;

  if (round === maxRound) return 'F';
  if (round === maxRound - 1) return 'SF';
  if (round === maxRound - 2) return 'QF';
  if (round === maxRound - 3) return 'R16';
  if (round === maxRound - 4) return 'R32';
  if (round === maxRound - 5) return 'R64';
  if (round === maxRound - 6) return 'R128';

  const playersAtRound = Math.pow(2, maxRound - round + 1);
  return `R${playersAtRound}`;
}

export function getDynamicRoundNames(maxRound: number): Record<number, string> {
  const names: Record<number, string> = {};
  for (let r = 1; r <= maxRound; r++) {
    names[r] = getRoundName(r, maxRound);
  }
  return names;
}

export const getCategory = (category: string) => {
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

/** Maps DB status → `status.*` message keys (translate in UI). */
export const getStatusLabelKeys: Record<string, string> = {
  STANDBY: 'standby',
  draft: 'draft',
  UPCOMING: 'upcoming',
  upcoming: 'upcoming',
  OPEN: 'open',
  active: 'active',
  published: 'published',
  LOCKED: 'locked',
  IN_PROGRESS: 'inProgress',
  FINISHED: 'finished',
  finished: 'finished',
  completed: 'finished',
};

/** @deprecated Prefer getStatusLabelKeys + next-intl. Portuguese fallbacks only. */
export const getStatusLabels: Record<string, string> = {
  STANDBY: 'Standby',
  draft: 'Rascunho',
  UPCOMING: 'Em breve',
  upcoming: 'Em breve',
  OPEN: 'Aberto para palpites',
  active: 'Ativo',
  published: 'Ativo',
  LOCKED: 'Apostas Fechadas',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizado',
  finished: 'Finalizado',
  completed: 'Finalizado',
};

export const DateBR = () => {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return d;
};
