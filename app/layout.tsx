import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout required by Next.js.
 * html/body live in [locale]/layout so `lang` matches the active locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
