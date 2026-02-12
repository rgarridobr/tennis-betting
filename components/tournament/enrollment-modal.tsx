'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Check, Trophy, Loader2 } from 'lucide-react'

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  tournament: {
    id: number
    name: string
  }
}

export function EnrollmentModal({ isOpen, onClose, tournament }: EnrollmentModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'processing' | 'success'>('info')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleEnroll = async () => {
    setIsProcessing(true)
    setStep('processing')

    try {
      const response = await fetch('/api/tournament/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: tournament.id }),
      })

      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 2000)
      } else {
        setStep('info')
      }
    } catch {
      setStep('info')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('info')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'info' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Participar do Bolao
              </DialogTitle>
              <DialogDescription>
                Inscreva-se no bolao de {tournament.name} e dispute com outros participantes!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Faça palpites em todas as 127 partidas do Grand Slam</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Ganhe pontos progressivos por rodada (5 a 50 pts)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Dispute o ranking com outros participantes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleEnroll} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                Inscrever-se
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-emerald-600 animate-spin mb-4" />
            <p className="font-semibold text-lg text-slate-900">Processando inscricao...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-lg text-emerald-600">Inscricao confirmada!</p>
            <p className="text-sm text-slate-500 mt-1">Agora você pode fazer seus palpites</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
