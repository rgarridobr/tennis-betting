'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { prepareTournamentAction, resetTournamentToStandbyAction, finishTournamentAction } from '@/lib/actions/admin'
import { Loader2, PlayCircle, RotateCcw, AlertTriangle, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  tournamentId: number
  status: string
  finalCompleted?: boolean
}

export function TournamentStatusTransition({ tournamentId, status, finalCompleted = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isFinished = status === 'FINISHED' || status === 'finished' || status === 'completed'

  function handleReset() {
    setShowResetConfirm(false)
    startTransition(async () => {
      try {
        const result = await resetTournamentToStandbyAction(tournamentId)
        if (result.success) {
          toast.success('Chaveamento excluído e torneio em Standby')
        } else {
          toast.error(result.error || 'Erro ao resetar torneio')
        }
      } catch (error) {
        toast.error('Erro ao resetar torneio')
      }
    })
  }

  function handlePrepare() {
    startTransition(async () => {
      try {
        const result = await prepareTournamentAction(tournamentId)
        if (result.success) {
          toast.success('Chaveamento gerado e torneio visível!')
        } else {
          toast.error(result.error || 'Erro ao preparar torneio')
        }
      } catch (error) {
        toast.error('Erro ao preparar torneio')
      }
    })
  }

  function handleFinish() {
    startTransition(async () => {
      try {
        const result = await finishTournamentAction(tournamentId)
        if (result.success) {
          toast.success('Torneio finalizado com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao finalizar torneio')
        }
      } catch (error) {
        toast.error('Erro ao finalizar torneio')
      }
    })
  }

  if (status === 'STANDBY' || status === 'upcoming') {
    return (
      <Button
        onClick={handlePrepare}
        disabled={isPending}
        variant="default"
        className="rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-12 px-6 gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
        Preparar Chaveamento (Tornar Visível)
      </Button>
    )
  }

  if (status === 'UPCOMING') {
    return (
      <>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowResetConfirm(true)}
            disabled={isPending}
            variant="outline"
            className="rounded-2xl font-black border-2 border-slate-200 text-slate-600 hover:bg-slate-50 h-12 px-6 gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Ocultar (Voltar para Standby)
          </Button>
        </div>

        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
            <DialogHeader className="pt-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-slate-900">Voltar para Standby?</DialogTitle>
              <DialogDescription className="text-center text-slate-500 font-medium px-4">
                Esta ação irá <span className="font-bold text-rose-600 underline">EXCLUIR</span> permanentemente o chaveamento atual e todos os palpites já realizados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl font-bold h-12 border-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                variant="destructive"
                className="flex-1 rounded-xl font-black h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100"
              >
                Sim, Resetar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (!isFinished && finalCompleted) {
    return (
      <Button
        onClick={handleFinish}
        disabled={isPending}
        className="rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-12 px-6 gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
        Finalizar Torneio
      </Button>
    )
  }

  return null
}
