'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { publishTournamentAction } from '@/lib/actions/admin'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  tournamentId: number
}

export function PublishBracketButton({ tournamentId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    if (!confirm('Deseja publicar o chaveamento? Isso bloqueará mudanças estruturais e iniciará o torneio.')) {
      return
    }

    startTransition(async () => {
      const result = await publishTournamentAction(tournamentId)
      if (result.success) {
        toast.success('Chaveamento publicado com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao publicar chaveamento')
      }
    })
  }

  return (
    <Button
      onClick={handlePublish}
      disabled={isPending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 h-12 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 gap-2"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle2 className="w-5 h-5" />
      )}
      {isPending ? 'Publicando...' : 'Publicar Chaveamento'}
    </Button>
  )
}
