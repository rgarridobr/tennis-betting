import { defineRouting } from 'next-intl/routing';

/**
 * Locales: pt (pt-BR) default, en (en-US).
 * localePrefix: 'as-needed' keeps Portuguese URLs clean (/torneios)
 * and prefixes English only (/en/torneios).
 */
export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
