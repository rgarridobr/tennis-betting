import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlobalPrizeFloatingBadge } from '@/components/dashboard/global-prize-floating-badge';
import { routing } from '@/i18n/routing';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const ogLocale = locale === 'en' ? 'en_US' : 'pt_BR';

  return {
    metadataBase: new URL('https://www.tennispool.com.br'),
    title: {
      template: '%s | TennisPool',
      default: t('title'),
    },
    description: t('description'),
    keywords: t('keywords').split(','),
    authors: [{ name: 'TennisPool', url: 'https://www.tennispool.com.br' }],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://www.tennispool.com.br/',
      siteName: 'TennisPool',
      type: 'website',
      locale: ogLocale,
      images: [
        {
          url: 'https://www.tennispool.com.br/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['https://www.tennispool.com.br/twitter-image.png'],
      site: '@TennisPool',
      creator: '@TennisPool',
    },
    icons: {
      icon: '/favicon.ico?v=2',
      apple: '/apple-icon.png?v=2',
      other: [{ rel: 'manifest', url: '/site.webmanifest' }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering of this locale segment
  setRequestLocale(locale);

  const messages = await getMessages();
  const htmlLang = locale === 'en' ? 'en-US' : 'pt-BR';

  return (
    <html
      lang={htmlLang}
      className={`${geist.className} ${geistMono.className}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Toaster position="top-right" richColors />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'TennisPool',
                url: 'https://www.tennispool.com.br',
                potentialAction: {
                  '@type': 'SearchAction',
                  target:
                    'https://www.tennispool.com.br/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              }),
            }}
          />
          <TooltipProvider>
            {children}
            <GlobalPrizeFloatingBadge />
          </TooltipProvider>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
