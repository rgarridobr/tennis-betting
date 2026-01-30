'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Trophy, Users, Wallet } from 'lucide-react'
import { EnrollmentModal } from './enrollment-modal'
import type { Tournament, UserTournamentStatus } from '@/lib/data'

interface EnrollmentBannerProps {
  tournament: Tournament
  participants: number
  prizePool: number
  enrollmentStatus: UserTournamentStatus
}

export function EnrollmentBanner({
  tournament,
  participants,
  prizePool,
  enrollmentStatus,
}: EnrollmentBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (enrollmentStatus.payment_status === 'pending') {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Pagamento pendente</h3>
                <p className="text-sm text-amber-700">
                  Finalize o pagamento de {formatCurrency(tournament.entry_fee)} para fazer seus palpites
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Finalizar pagamento
            </Button>
          </div>
        </CardContent>

        <EnrollmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tournament={tournament}
          participants={participants}
          prizePool={prizePool}
        />
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Participe do Bolão!
                </h3>
                <p className="text-muted-foreground mt-1">
                  Pague a taxa de inscrição para fazer seus palpites e concorrer ao prêmio
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      Taxa: <span className="font-semibold text-emerald-600">{formatCurrency(tournament.entry_fee)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <span className="font-semibold">{participants}</span> participantes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">
                      Prêmio: <span className="font-semibold text-amber-600">{formatCurrency(prizePool)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                Inscrever-se por {formatCurrency(tournament.entry_fee)}
              </Button>
              <Badge variant="secondary" className="text-xs">
                Pagamento seguro via PIX ou cartão
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tournament={tournament}
        participants={participants}
        prizePool={prizePool}
      />
    </>
  )
}
