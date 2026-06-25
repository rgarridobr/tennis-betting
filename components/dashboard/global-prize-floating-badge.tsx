import { getSession } from '@/lib/auth';
import { getFeaturedPrizeTournament } from '@/lib/data';
import { PrizeFloatingBadge } from '@/components/dashboard/prize-floating-badge';

export async function GlobalPrizeFloatingBadge() {
  const user = await getSession();

  if (!user || user.is_admin) return null;

  const tournament = await getFeaturedPrizeTournament();

  return <PrizeFloatingBadge tournament={tournament} />;
}
