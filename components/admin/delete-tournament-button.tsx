'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteTournamentAction } from '@/lib/actions/admin'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'

interface Props {
  tournamentId: number
  tournamentName: string
}

export function DeleteTournamentButton({ tournamentId, tournamentName }: Props) {
  const t = useTranslations('admin')
  const tButtons = useTranslations('buttons')
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDelete() {
    setShowConfirm(false)
    startTransition(async () => {
      const result = await deleteTournamentAction(tournamentId)
      if (result.success) {
        toast.success(t('deleteTournament.toastSuccess'))
      } else {
        toast.error(result.error || t('deleteTournament.toastError'))
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl shrink-0"
        title={t('deleteTournament.tooltip')}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">
              {t('deleteTournament.title')}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t('deleteTournament.description', { name: tournamentName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1 rounded-xl font-black h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100"
            >
              {t('deleteTournament.yesDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
