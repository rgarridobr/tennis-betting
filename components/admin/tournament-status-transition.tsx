'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateTournamentStatusAction } from '@/lib/actions/admin'
import { Edit3, Clock, Loader2 } from 'lucide-react'
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
        toast.success(`Torneio movido para ${newStatus === 'draft' ? 'Rascunho' : 'Standby'}`)
      } catch (error) {
        toast.error('Erro ao atualizar status do torneio')
      }
    })
  }

  if (status === 'upcoming') {
    return (
      <Button
        onClick={() => handleTransition('draft')}
        disabled={isPending}
        variant="outline"
        className="rounded-2xl font-black border-2 border-rose-200 text-rose-600 hover:bg-rose-50 h-12 px-6 gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
        Iniciar Definição (Mover para Rascunho)
      </Button>
    )
  }

  if (status === 'draft') {
    return (
      <Button
        onClick={() => handleTransition('upcoming')}
        disabled={isPending}
        variant="outline"
        className="rounded-2xl font-black border-2 border-amber-200 text-amber-600 hover:bg-amber-50 h-12 px-6 gap-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
        Colocar em Standby
      </Button>
    )
  }

  return null
}
