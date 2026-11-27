'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CalendarRange } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  year: number;
  years: number[];
}

export function TournamentYearSelect({ year, years }: Props) {
  const router = useRouter();
  const t = useTranslations('admin');

  return (
    <div>
      <h3 id="tournament-year-label" className="mb-3 flex items-center gap-2 text-lg font-black text-slate-900 lg:mb-6 lg:text-xl">
        <CalendarRange aria-hidden="true" className="size-5 text-emerald-600" />
        {t('filterSeason')}
      </h3>
      <Select
        value={String(year)}
        onValueChange={(value) => router.push({ pathname: '/admin/torneios', query: { year: value } }, { scroll: false })}
      >
        <SelectTrigger id="tournament-year" aria-labelledby="tournament-year-label" className="w-full border-slate-200 bg-white font-bold text-slate-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
