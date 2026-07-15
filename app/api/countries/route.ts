import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

interface FirstOrgCountry {
  country: string;
}

interface FirstOrgResponse {
  status: string;
  'status-code': number;
  version: string;
  access: string;
  total: number;
  offset: number;
  limit: number;
  data: Record<string, FirstOrgCountry>;
}

export async function GET() {
  const t = await getTranslations('errors');
  try {
    const response = await fetch('https://api.first.org/data/v1/countries?limit=300');
    if (!response.ok) {
      throw new Error(`Country API responded with status ${response.status}`);
    }

    const data = (await response.json()) as FirstOrgResponse;
    const countries = Object.entries(data.data)
      .map(([code, item]) => ({
        name: item.country.trim(),
        code,
      }))
      .filter((country) => country.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return NextResponse.json(countries, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Country proxy error:', error);
    return NextResponse.json({ error: t('apiCountriesFailed') }, { status: 500 });
  }
}
