'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const QUOTE_KEYS = ['quote1', 'quote2', 'quote3', 'quote4', 'quote5'] as const;

export function RotatingQuote() {
  const t = useTranslations('auth');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTE_KEYS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      key={index}
      className="text-white/90 text-xl font-medium max-w-md transition-opacity duration-700 ease-in-out animate-fade"
    >
      {t(QUOTE_KEYS[index])}
    </p>
  );
}
