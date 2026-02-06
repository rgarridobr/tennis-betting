import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { enrollInTournament, confirmTournamentPayment, getUserTournamentStatus } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { tournamentId } = await request.json()

    if (!tournamentId) {
      return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 })
    }

    const status = await getUserTournamentStatus(user.id, tournamentId)
    if (status.payment_status === 'paid') {
      return NextResponse.json({ error: 'Ja inscrito neste torneio' }, { status: 400 })
    }

    // Enroll user
    await enrollInTournament(user.id, tournamentId)

    // Auto-confirm payment (simplified flow)
    await confirmTournamentPayment(user.id, tournamentId)

    return NextResponse.json({ success: true, message: 'Inscricao realizada com sucesso!' })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Erro ao processar inscricao' }, { status: 500 })
  }
}
