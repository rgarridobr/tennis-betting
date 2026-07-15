import { NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

interface IbgeState {
  id: number;
  sigla: string;
  nome: string;
}

export async function GET() {
  const t = await getTranslations('errors');
  try {
    const response = await fetch('https://brasilapi.com.br/api/ibge/uf/v1', {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`States API responded with status ${response.status}`);
    }

    const states = (await response.json()) as IbgeState[];
    const sorted = states.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('IBGE states proxy error:', error);
    return NextResponse.json({ error: t('apiStatesFailed') }, { status: 500 });
  }
}
