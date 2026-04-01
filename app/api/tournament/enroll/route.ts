import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isUserEnrolled, enrollUser } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const enrolled = await isUserEnrolled(user.id, tournamentId);
    if (enrolled) {
      return NextResponse.json({ error: 'Já inscrito neste torneio' }, { status: 400 });
    }

    await enrollUser(user.id, tournamentId);

    return NextResponse.json({ success: true, message: 'Inscrição realizada com sucesso!' });
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Erro ao processar inscrição' }, { status: 500 })
  }
}
