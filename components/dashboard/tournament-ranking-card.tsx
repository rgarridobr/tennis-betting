import { TournamentCard } from './tournament-card';
import type { Tournament } from '@/lib/data';

interface TournamentRankingCardProps {
  tournament: Tournament;
  href: string;
}

export function TournamentRankingCard({ tournament, href }: TournamentRankingCardProps) {
  return <TournamentCard tournament={tournament} href={href} />;
}
