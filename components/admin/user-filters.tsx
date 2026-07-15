'use client';

import { Input } from '@/components/ui/input';
import { Search, FilterX } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface UserFiltersProps {
  filterOptions: {
    states: string[];
    cities: string[];
    clubs: string[];
  };
}

export function UserFilters({ filterOptions }: UserFiltersProps) {
  const tShared = useTranslations('shared');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('buttons');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');

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

    if (value) {
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

  const hasActiveFilters =
    searchParams.has('search') ||
    searchParams.has('state') ||
    searchParams.has('city') ||
    searchParams.has('club');

  const currentState = searchParams.get('state') || '';
  const currentCity = searchParams.get('city') || '';
  const currentClub = searchParams.get('club') || '';

  // Filter cities based on selected state (if we have state info in city names)
  // Since cities are just names, we show all distinct cities from the DB
  const availableCities = filterOptions.cities;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{tCommon('search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={tCommon('search')}
              className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-12 rounded-2xl text-slate-500 font-bold hover:text-rose-500 hover:bg-rose-50"
          >
            <FilterX className="w-4 h-4 mr-2" />
            {tButtons('clear')}
          </Button>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse pb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{tShared('state')}</label>
          <Select
            value={currentState}
            onValueChange={(value) => handleFilterChange('state', value === '_all' ? '' : value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder={tShared('selectState')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{tShared('selectState')}</SelectItem>
              {filterOptions.states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{tShared('city')}</label>
          <Select
            value={currentCity}
            onValueChange={(value) => handleFilterChange('city', value === '_all' ? '' : value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder={tShared('selectCity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{tShared('selectCity')}</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">{tShared('clubPlaceholder')}</label>
          <Select
            value={currentClub}
            onValueChange={(value) => handleFilterChange('club', value === '_all' ? '' : value)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder={tShared('clubPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{tShared('clubPlaceholder')}</SelectItem>
              {filterOptions.clubs.map((club) => (
                <SelectItem key={club} value={club}>
                  {club}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
