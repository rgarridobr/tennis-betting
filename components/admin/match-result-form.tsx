'use client'

import { useState, useTransition } from 'react'
import { updateMatchResultAction } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface MatchResultFormProps {
  matchId: number
  tournamentId: number
  player1Name: string
  player2Name: string
}

export function MatchResultForm({
  matchId,
  tournamentId,
  player1Name,
  player2Name,
}: MatchResultFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateMatchResultAction(formData)
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
          Registrar Resultado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Resultado</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="match_id" value={matchId} />
          <input type="hidden" name="tournament_id" value={tournamentId} />

          <div className="space-y-3">
            <Label>Vencedor</Label>
            <RadioGroup name="winner" required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="winner1" />
                <Label htmlFor="winner1" className="font-normal">
                  {player1Name}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="winner2" />
                <Label htmlFor="winner2" className="font-normal">
                  {player2Name}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1_score">Placar {player1Name}</Label>
              <Input
                id="player1_score"
                name="player1_score"
                placeholder="Ex: 6-4 6-3"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player2_score">Placar {player2Name}</Label>
              <Input
                id="player2_score"
                name="player2_score"
                placeholder="Ex: 4-6 3-6"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Resultado'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
