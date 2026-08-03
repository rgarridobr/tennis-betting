'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, CheckCircle2, FilterX, PlayCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

interface TournamentFiltersProps {
  hideUpcoming?: boolean;
  defaultStatus?: 'active' | 'upcoming' | 'finished';
  statusCounts?: {
    active: number;
    upcoming: number;
    finished: number;
  };
}

export function TournamentFilters({ hideUpcoming, defaultStatus = 'active', statusCounts }: TournamentFiltersProps = {}) {
  const t = useTranslations('tournaments');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const currentStatus = searchParams.get('status') || defaultStatus;
  const currentCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        handleFilterChange('search', search);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  function handleFilterChange(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (value && value !== 'all') {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearFilters() {
    setSearch('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const hasActiveFilters = searchParams.has('search') || searchParams.has('status') || searchParams.has('category');

  return (
    <div className="space-y-6 mb-12">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{t('searchLabel')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{t('category')}</label>
          <Select value={currentCategory} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
              <SelectValue placeholder={t('allCategories')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200">
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              <SelectItem value="GRAND_SLAM">Grand Slam</SelectItem>
              <SelectItem value="MASTERS_1000">Masters 1000</SelectItem>
              <SelectItem value="ATP_500">ATP 500</SelectItem>
              <SelectItem value="ATP_250">ATP 250</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-12 rounded-2xl text-slate-500 font-bold hover:text-rose-500 hover:bg-rose-50"
          >
            <FilterX className="w-4 h-4 mr-2" />
            {t('clear')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Tabs value={currentStatus} onValueChange={(value) => handleFilterChange('status', value)} className="w-full">
          <TabsList className="relative bg-gradient-to-br from-[#041a16] via-[#062c25] to-[#005e50] p-1.5 rounded-2xl h-auto w-full flex flex-col sm:flex-row gap-1.5 sm:gap-0 border border-white/10 shadow-[0_18px_40px_-24px_rgba(4,26,22,0.9)] ring-1 ring-slate-900/10">
            <TabsTrigger
              value="active"
              className="group min-w-0 w-full sm:basis-0 flex-1 justify-start sm:justify-center rounded-xl px-4 py-3 sm:py-2.5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all"
            >
              <PlayCircle className="w-4 h-4 text-emerald-500 transition-transform group-data-[state=active]:scale-110" />
              <span>{t('filterActive')}</span>
              {statusCounts && (
                <span className="min-w-6 rounded-full bg-white/15 px-1.5 py-0.5 text-[11px] leading-none text-white/80 group-data-[state=active]:bg-emerald-50 group-data-[state=active]:text-emerald-700">
                  {statusCounts.active}
                </span>
              )}
            </TabsTrigger>
            {!hideUpcoming && (
              <TabsTrigger
                value="upcoming"
                className="group min-w-0 w-full sm:basis-0 flex-1 justify-start sm:justify-center rounded-xl px-4 py-3 sm:py-2.5 text-sm font-black text-white/90 hover:bg-white/10 hover:text-white data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm transition-all"
              >
                <CalendarDays className="w-4 h-4 text-amber-500 transition-transform group-data-[state=active]:scale-110" />
                <span>{t('filterUpcoming')}</span>
                {statusCounts && (
                  <span className="min-w-6 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[11px] leading-none text-amber-100 group-data-[state=active]:bg-white group-data-[state=active]:text-amber-700">
                    {statusCounts.upcoming}
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="finished"
              className="group min-w-0 w-full sm:basis-0 flex-1 justify-start sm:justify-center rounded-xl px-4 py-3 sm:py-2.5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-300 transition-transform group-data-[state=active]:scale-110 group-data-[state=active]:text-slate-400" />
              <span>{t('filterFinished')}</span>
              {statusCounts && (
                <span className="min-w-6 rounded-full bg-white/15 px-1.5 py-0.5 text-[11px] leading-none text-white/80 group-data-[state=active]:bg-slate-100 group-data-[state=active]:text-slate-700">
                  {statusCounts.finished}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isPending && (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">{t('updating')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
