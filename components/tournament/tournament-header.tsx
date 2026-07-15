'use client';

import { Gift, Icon, Users } from 'lucide-react';
import type { Tournament } from '@/lib/data';
import { PageHero } from '../shared/page-hero';
import { Card, CardContent } from '../ui/card';
import { tennisBall } from '@lucide/lab';
import { getCategory } from '@/lib/utils';
import {
  getTournamentImage,
  getTournamentStatus,
  normalizeSurfaceKey,
} from '@/lib/tournament';
import { useLocale, useTranslations } from 'next-intl';

interface TournamentHeaderProps {
  tournament: Tournament;
  participants?: number;
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const dateLocale = locale === 'en' ? 'en-US' : 'pt-BR';
  return date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long' });
}

function formatTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const dateLocale = locale === 'en' ? 'en-US' : 'pt-BR';
  return date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
}

export function TournamentHeader({ tournament, participants = 0 }: TournamentHeaderProps) {
  const t = useTranslations('tournaments');
  const tStatus = useTranslations('status');
  const tSurfaces = useTranslations('surfaces');
  const locale = useLocale();

  const { statusKey } = getTournamentStatus(tournament);
  const statusLabel = tStatus(statusKey);
  const surfaceKey = normalizeSurfaceKey(tournament.surface);
  const surface =
    surfaceKey === 'Hard' || surfaceKey === 'Clay' || surfaceKey === 'Grass'
      ? tSurfaces(surfaceKey)
      : tournament.surface;
  const bgImage = getTournamentImage(tournament);

  return (
    <PageHero
      title={tournament.name}
      subtitle={
        tournament.location +
        `\n${formatDate(tournament.start_date, locale)} - ${formatDate(tournament.end_date, locale)}` +
        `\n ${t('headerStartsAt')} ${formatTime(tournament.start_date, locale)}` +
        `\n${surface}`
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
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">{t('headerCategory')}</p>
                <p className="text-xl md:text-2xl font-black text-white">{getCategory(tournament.category)}</p>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-100/70 text-xs font-bold uppercase tracking-wider">{t('headerEnrolled')}</p>
                <p className="text-xl md:text-2xl font-black text-white">{participants}</p>
              </div>{' '}
            </div>

            {tournament.prize_description && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <Gift className="w-6 h-6 text-rose-300" />
                </div>
                <div>
                  <p className="text-rose-100/80 text-xs font-bold uppercase tracking-wider">{t('headerPrize')}</p>
                  <p className="text-sm md:text-base font-bold text-white whitespace-pre-line leading-relaxed">
                    {tournament.prize_description}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageHero>
  );
}
