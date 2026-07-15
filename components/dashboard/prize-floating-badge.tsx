'use client';

import { Link } from '@/i18n/navigation'
import { Gift, Trophy } from 'lucide-react';
import type { Tournament } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

interface PrizeFloatingBadgeProps {
  tournament: Tournament | null;
}

export function PrizeFloatingBadge({ tournament }: PrizeFloatingBadgeProps) {
  const t = useTranslations('dashboard');

  if (!tournament?.prize_description) return null;

  return (
    <div className="fixed bottom-5 right-4 z-40 sm:bottom-8 sm:right-8">
      <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex h-14 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-emerald-200/80 bg-white/95 px-3 text-left text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:px-4"
          aria-label={t('prizeOpen')}
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white">
              <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
            </span>
            <Gift className="h-5 w-5" />
          </span>

          <span className="hidden min-w-0 sm:block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600">
              {t('prizeAvailable')}
            </span>
            <span className="block max-w-[11rem] truncate text-sm font-black text-slate-900 sm:max-w-[15rem]">
              {tournament.name}
            </span>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.25)] sm:max-w-md">
        <div className="px-6 pt-6">
          <div className="flex items-start gap-4 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Trophy className="h-6 w-6" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">{t('prizeInPlay')}</DialogTitle>
              <DialogDescription className="font-bold text-slate-500">{tournament.name}</DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5">
          <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">{t('prizeWinnerGets')}</p>
            <p className="mt-2 whitespace-pre-line text-base font-bold leading-relaxed text-slate-900">
              {tournament.prize_description}
            </p>
          </div>

          <DialogClose asChild>
            <Button asChild className="h-12 w-full rounded-2xl bg-emerald-600 font-black hover:bg-emerald-500">
              <Link href={`/torneios/${tournament.id}`}>{t('prizeViewTournament')}</Link>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
      </Dialog>
    </div>
  );
}
