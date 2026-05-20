import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tennispool.com.br'),
  title: {
    template: '%s | TennisPool',
    default: 'TennisPool – Grupos de Tênis Online',
  },
  description:
    'TennisPool: participe de grupos de tênis, faça palpites nos jogos e dispute no ranking com seus amigos.',
  keywords: [
    'TennisPool',
    'grupo de tênis',
    'palpites',
    'ranking',
    'torneios de tênis',
  ],
  authors: [
    { name: 'TennisPool', url: 'https://www.tennispool.com.br' },
  ],
  openGraph: {
    title: 'TennisPool – Grupos de Tênis Online',
    description:
      'Participe de grupos de tênis com pontos por palpites e dispute com seus amigos.',
    url: 'https://www.tennispool.com.br/',
    siteName: 'TennisPool',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://www.tennispool.com.br/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Logo do TennisPool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TennisPool – Grupos de Tênis',
    description:
      'TennisPool: faça palpites, acumule pontos e veja seu nome no topo do ranking.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${_geist.className} ${_geistMono.className}`}>
      <body className={`font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        {/* structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TennisPool",
              url: "https://www.tennispool.com.br",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.tennispool.com.br/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
