import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { enrollInTournament, confirmTournamentPayment, getUserTournamentStatus } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { tournamentId, paymentMethod } = await request.json()

    if (!tournamentId || !paymentMethod) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Check if already enrolled and paid
    const status = await getUserTournamentStatus(user.id, tournamentId)
    if (status.payment_status === 'paid') {
      return NextResponse.json({ error: 'Já inscrito neste torneio' }, { status: 400 })
    }

    // Enroll user (creates pending entry if not exists)
    await enrollInTournament(user.id, tournamentId)

    // Simulate payment processing (in production, integrate with payment gateway)
    // For now, we'll just confirm the payment after a small delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Confirm payment
    await confirmTournamentPayment(user.id, tournamentId)

    return NextResponse.json({ 
      success: true, 
      message: 'Inscrição realizada com sucesso!' 
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar inscrição' },
      { status: 500 }
    )
  }
}
