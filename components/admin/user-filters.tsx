'use client';

import { Input } from '@/components/ui/input';
import { Search, FilterX } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function UserFilters() {
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
    params.set('page', '1'); // Reset to page 1 on filter change

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

  const hasActiveFilters = searchParams.has('search');

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
      <div className="flex-1 w-full space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">Buscar Usuário</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, email ou apelido..."
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
          Limpar
        </Button>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-slate-400 animate-pulse pb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      )}
    </div>
  );
}
