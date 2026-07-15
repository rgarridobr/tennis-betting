'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LOCALE_META: Record<
  AppLocale,
  { flag: string; short: string; native: string }
> = {
  pt: { flag: '🇧🇷', short: 'PT', native: 'Português' },
  en: { flag: '🇺🇸', short: 'EN', native: 'English' },
};

interface LanguageSwitcherProps {
  /** Compact mode for tight header slots */
  variant?: 'default' | 'compact';
  /** dark = headers verdes; light = páginas públicas com fundo claro */
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Elegant language dropdown.
 * Uses next-intl navigation so the locale segment stays in sync
 * without full hard reloads that drop client state.
 *
 * QA notes:
 * - Client-only (`useLocale` + router.replace) avoids hydration mismatch
 *   between server default locale and cookie-detected locale.
 * - Labels use fixed short codes (PT/EN) so text expansion does not
 *   shift the header layout between languages.
 */
export function LanguageSwitcher({
  variant = 'default',
  tone = 'dark',
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const current = LOCALE_META[locale] ?? LOCALE_META.pt;

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          aria-label={t('switchTo')}
          className={cn(
            'gap-1.5 rounded-xl font-bold',
            'min-w-[2.75rem] sm:min-w-[4.5rem]',
            'focus-visible:ring-2 focus-visible:ring-emerald-400/60',
            tone === 'dark'
              ? 'text-white hover:text-[#6EC46C] hover:bg-white/10'
              : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200/80 bg-white/80',
            className,
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Globe className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {variant === 'default' && (
            <span className="hidden sm:inline tabular-nums tracking-wide">
              {current.short}
            </span>
          )}
          <span className="sm:hidden text-xs tabular-nums" aria-hidden>
            {current.short}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 p-1.5">
        <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t('label')}
        </p>
        {routing.locales.map((code) => {
          const meta = LOCALE_META[code];
          const selected = code === locale;

          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => switchLocale(code)}
              className={cn(
                'cursor-pointer gap-2 rounded-lg px-2 py-2.5',
                selected && 'bg-emerald-50 text-emerald-800',
              )}
            >
              <span className="text-base leading-none" aria-hidden>
                {meta.flag}
              </span>
              <span className="flex-1 text-sm font-semibold">{meta.native}</span>
              <span className="text-[10px] font-black text-muted-foreground tabular-nums">
                {meta.short}
              </span>
              {selected && (
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
