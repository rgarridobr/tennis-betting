import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isUserEnrolled, enrollUser } from '@/lib/data';
import { getTranslations } from 'next-intl/server';

export async function POST(request: Request) {
  const t = await getTranslations('errors');
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: t('unauthorized') }, { status: 401 });
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: t('invalidData') }, { status: 400 });
    }

    const enrolled = await isUserEnrolled(user.id, tournamentId);
    if (enrolled) {
      return NextResponse.json({ error: t('alreadyEnrolled') }, { status: 400 });
    }

    await enrollUser(user.id, tournamentId);

    return NextResponse.json({ success: true, message: t('enrollSuccess') });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: t('enrollFailed') }, { status: 500 });
  }
}
