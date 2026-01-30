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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Trophy, Users, Wallet, CreditCard, QrCode, Loader2 } from 'lucide-react'

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  tournament: {
    id: number
    name: string
    entry_fee: number
    start_date: string
    end_date: string
  }
  participants: number
  prizePool: number
}

type PaymentMethod = 'pix' | 'card' | null

export function EnrollmentModal({
  isOpen,
  onClose,
  tournament,
  participants,
  prizePool,
}: EnrollmentModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleEnroll = async () => {
    setStep('payment')
  }

  const handlePayment = async () => {
    if (!paymentMethod) return
    
    setIsProcessing(true)
    setStep('processing')

    try {
      const response = await fetch('/api/tournament/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament.id,
          paymentMethod,
        }),
      })

      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('info')
      setPaymentMethod(null)
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
                Participar do Bolão
              </DialogTitle>
              <DialogDescription>
                Inscreva-se no bolão de {tournament.name} e dispute com outros participantes!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de inscrição</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(tournament.entry_fee)}
                      </p>
                    </div>
                    <Wallet className="w-10 h-10 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold">{participants}</p>
                    <p className="text-xs text-muted-foreground">Participantes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                    <p className="text-lg font-bold">{formatCurrency(prizePool + tournament.entry_fee)}</p>
                    <p className="text-xs text-muted-foreground">Prêmio estimado</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Faça palpites em todas as partidas</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Ganhe 10 pontos por acerto</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Dispute o prêmio com outros participantes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleEnroll} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Continuar
              </Button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Escolha a forma de pagamento</DialogTitle>
              <DialogDescription>
                Valor: {formatCurrency(tournament.entry_fee)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">PIX</p>
                  <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                </div>
                {paymentMethod === 'pix' && (
                  <Check className="w-5 h-5 text-emerald-600 ml-auto" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-border hover:border-emerald-300'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Cartão de Crédito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
                </div>
                {paymentMethod === 'card' && (
                  <Check className="w-5 h-5 text-emerald-600 ml-auto" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!paymentMethod}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Pagar {formatCurrency(tournament.entry_fee)}
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-emerald-600 animate-spin mb-4" />
            <p className="font-semibold text-lg">Processando pagamento...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Aguarde enquanto confirmamos seu pagamento
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-semibold text-lg text-emerald-600">Inscrição confirmada!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agora você pode fazer seus palpites
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
