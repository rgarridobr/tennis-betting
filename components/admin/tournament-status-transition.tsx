'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateTournamentStatusAction, prepareTournamentAction } from '@/lib/actions/admin'
import { Edit3, Clock, Loader2, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  tournamentId: number
  status: string
}

export function TournamentStatusTransition({ tournamentId, status }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleTransition(newStatus: string) {
    startTransition(async () => {
      try {
        await updateTournamentStatusAction(tournamentId, newStatus)
        toast.success(`Torneio movido para ${newStatus}`)
      } catch (error) {
        toast.error('Erro ao atualizar status do torneio')
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
      <Button
        onClick={() => handleTransition('STANDBY')}
        disabled={isPending}
        variant="outline"
        className="rounded-2xl font-black border-2 border-slate-200 text-slate-600 hover:bg-slate-50 h-12 px-6 gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
        Ocultar (Mover para Standby)
      </Button>
    )
  }

  return null
}
