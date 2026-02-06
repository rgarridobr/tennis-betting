'use client'

import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateTournamentStatusAction } from '@/lib/actions/admin'

interface TournamentStatusSelectProps {
  tournamentId: number
  currentStatus: string
}

export function TournamentStatusSelect({
  tournamentId,
  currentStatus,
}: TournamentStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(value: string) {
    startTransition(async () => {
      await updateTournamentStatusAction(tournamentId, value)
    })
  }

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="upcoming">Em breve</SelectItem>
        <SelectItem value="active">Ativo</SelectItem>
        <SelectItem value="completed">Finalizado</SelectItem>
      </SelectContent>
    </Select>
  )
}
