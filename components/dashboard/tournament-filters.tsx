'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, FilterX } from 'lucide-react';
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
}

export function TournamentFilters({ hideUpcoming, defaultStatus = 'active' }: TournamentFiltersProps = {}) {
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={currentStatus} onValueChange={(value) => handleFilterChange('status', value)} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-full sm:w-auto flex">
            <TabsTrigger
              value="active"
              className="flex-1 rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
            >
              {t('filterActive')}
            </TabsTrigger>
            {!hideUpcoming && (
              <TabsTrigger
                value="upcoming"
                className="flex-1 rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
              >
                <span className="hidden sm:inline">{t('filterUpcoming')}</span>
                <span className="sm:hidden">{t('filterUpcomingShort')}</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="finished"
              className="flex-1 rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
            >
              {t('filterFinished')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isPending && (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">{t('updating')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
