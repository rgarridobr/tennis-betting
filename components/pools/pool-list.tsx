'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Lock, Users, ArrowRight, Trophy, Shield, MapPin } from 'lucide-react';
import type { Pool, Tournament } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreatePoolForm } from './create-pool-form';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

interface PoolListProps {
  myPools: Pool[];
  generalPools: Pool[];
  initialSearchResults: Pool[];
  tournaments?: Tournament[];
  isAdmin?: boolean;
  isAuthenticated?: boolean;
}

export function PoolList({
  myPools,
  generalPools,
  initialSearchResults: searchResults,
  tournaments = [],
  isAdmin = false,
  isAuthenticated = true,
}: PoolListProps) {
  const t = useTranslations('pools');
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    router.push(`/grupos?q=${encodeURIComponent(search)}`);
    setIsSearching(false);
  };

  return (
    <div className="space-y-16">
      {/* Search Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-500 shadow-inner">
              <Search className="w-7 h-7" />
            </div>
            {t('findTitle')}
          </h2>
          <p className="text-slate-500 mt-2 font-medium ml-1">
            {t('findSubtitle')}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 p-1">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <Input
                placeholder={t('searchPlaceholder')}
                className="pl-14 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all text-base shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 shrink-0"
              disabled={isSearching}
            >
              {isSearching ? t('searching') : t('search')}
            </Button>
          </form>
        </div>

        {searchResults.length > 0 && search && (
          <div className="mt-4 pt-4">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{t('searchResults')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {searchResults.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* My Pools */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-inner">
                <Users className="w-7 h-7" />
              </div>
              {t('myPoolsTitle')}
            </h2>
            <p className="text-slate-500 mt-2 font-medium ml-1">{t('myPoolsSubtitle')}</p>
          </div>
          {isAuthenticated ? (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs px-6 py-6 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 cursor-pointer"
            >
              {t('createNew')}
            </Button>
          ) : (
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs px-6 py-6 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 cursor-pointer"
            >
              <Link href="/login?redirectTo=/grupos">{t('createNew')}</Link>
            </Button>
          )}
        </div>

        {myPools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {myPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} isMember={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">{t('emptyTitle')}</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              {t('emptyBody')}
            </p>
          </div>
        )}
      </section>

      {/* General Pools */}
      {generalPools && generalPools.length > 0 && (
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-500 shadow-inner">
                <Trophy className="w-7 h-7" />
              </div>
              {t('generalTitle')}
            </h2>
            <p className="text-slate-500 mt-2 font-medium ml-1">{t('generalSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {generalPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </section>
      )}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[95vh] overflow-y-auto p-6 sm:p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">{t('createDialogTitle')}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {t('createDialogDescription')}
            </DialogDescription>
          </DialogHeader>

          {isAuthenticated && (
            <CreatePoolForm isAdmin={isAdmin} tournaments={tournaments} onCancel={() => setShowCreateDialog(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PoolCard({ pool, isMember }: { pool: Pool; isMember?: boolean }) {
  const t = useTranslations('pools');
  const tCommon = useTranslations('common');
  const isGeneral = pool.is_general;
  const isStatePool = pool.is_state_pool;

  return (
    <Link
      href={`/grupos/${pool.id}`}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-[2rem]"
    >
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-slate-200/60 transition-all duration-500 group hover:-translate-y-1.5 h-full flex flex-col relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110 pointer-events-none text-slate-900 z-0">
          {isStatePool ? (
            <MapPin size={140} strokeWidth={1} />
          ) : isGeneral ? (
            <Trophy size={140} strokeWidth={1} />
          ) : (
            <Users size={140} strokeWidth={1} />
          )}
        </div>

        {/* Card Header (Gradient) */}
        <div
          className={cn(
            'relative overflow-hidden shrink-0',
            isStatePool
              ? 'bg-gradient-to-br from-blue-500 to-indigo-700'
              : isGeneral
                ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700',
          )}
        >
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />

          <div className="px-6 py-6 flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 transform transition-transform duration-500 group-hover:scale-110">
              {isStatePool ? (
                <MapPin className="w-7 h-7 text-blue-500" />
              ) : isGeneral ? (
                <Trophy className="w-7 h-7 text-amber-500" />
              ) : (
                <Users className="w-7 h-7 text-emerald-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg md:text-xl text-white line-clamp-2 leading-tight tracking-tight">
                {pool.name}
              </h3>
            </div>

            {pool.password_hash && !isGeneral && (
              <div
                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-xl shadow-sm border border-white/10 shrink-0 self-start"
                title={t('requiresPassword')}
              >
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-4 relative z-10 flex-1 flex flex-col">
          <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6 flex-1">
            {pool.description || t('noDescription')}
          </p>

          <div className="flex items-center justify-between mt-auto py-5">
            <div className="flex items-center gap-2.5 text-slate-500 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Users className="w-4 h-4 text-slate-400" />
              <span>
                {pool.member_count}{' '}
                {pool.member_count === 1 ? tCommon('memberOne') : tCommon('memberOther')}
              </span>
            </div>

            <div
              className={cn(
                'flex items-center gap-1.5 font-bold text-sm uppercase tracking-wider px-4 py-2 rounded-xl transition-all',
                isMember
                  ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
              )}
            >
              {isMember ? t('viewRanking') : t('join')}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
