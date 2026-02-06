'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Wallet } from 'lucide-react'
import { EnrollmentModal } from './enrollment-modal'
import type { Tournament } from '@/lib/data'

interface EnrollmentBannerProps {
  tournament: Tournament
  enrollmentStatus: { is_enrolled: boolean; payment_status: string | null }
}

export function EnrollmentBanner({ tournament, enrollmentStatus }: EnrollmentBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
                  Aguardando confirmacao do administrador para liberar seus palpites.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
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
                <h3 className="font-bold text-lg text-slate-900">Participe do Bolao!</h3>
                <p className="text-slate-600 mt-1">
                  Inscreva-se para fazer seus palpites no chaveamento completo do {tournament.name}.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              Inscrever-se
            </Button>
          </div>
        </CardContent>
      </Card>

      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tournament={tournament}
      />
    </>
  )
}
