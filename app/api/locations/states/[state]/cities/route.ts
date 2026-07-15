import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

interface IbgeCity {
  id: number;
  nome: string;
}

interface BrasilApiCity {
  codigo_ibge: string;
  nome: string;
}

function formatCityName(name: string) {
  const lowercaseWords = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

  return name
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word) => {
      if (lowercaseWords.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1);
    })
    .join(' ');
}

interface RouteContext {
  params: Promise<{
    state: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const t = await getTranslations('errors');
  const { state } = await params;
  const stateCode = state.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(stateCode)) {
    return NextResponse.json({ error: t('apiInvalidState') }, { status: 400 });
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${stateCode}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Cities API responded with status ${response.status}`);
    }

    const data = (await response.json()) as BrasilApiCity[];
    const cities: IbgeCity[] = data.map((city) => ({
      id: Number(city.codigo_ibge),
      nome: formatCityName(city.nome),
    }));
    const sorted = cities.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('IBGE cities proxy error:', error);
    return NextResponse.json({ error: t('apiCitiesFailed') }, { status: 500 });
  }
}
