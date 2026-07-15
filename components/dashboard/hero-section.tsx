import { Trophy } from 'lucide-react';
import type { User } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';

interface HeroSectionProps {
  user: User | null;
}

export async function HeroSection({ user }: HeroSectionProps) {
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');

  return (
    <div className="container mx-auto px-4 md:px-32 py-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-75 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1530915534664-4ac6423816b7?q=80&w=1470&auto=format&fit=crop')`,
          }}
        />

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-transparent to-transparent" />

        <div className="relative px-6 py-12 sm:px-8 sm:py-16 md:px-10 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 mb-6 shadow-lg">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs tracking-wide">{tCommon('brandName')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {t('heroTitle')}{' '}
            <span className="text-emerald-400 drop-shadow-lg">{t('heroTitleHighlight')}</span>
          </h1>

          <p className="mt-5 text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            {t('heroSubtitle')}
          </p>

          {user && (
            <p className="mt-4 text-sm text-white/90">
              {t('welcome', { name: user.name })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
