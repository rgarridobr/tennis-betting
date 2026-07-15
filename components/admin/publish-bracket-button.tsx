'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { publishTournamentAction } from '@/lib/actions/admin'
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
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
  isReady: boolean
}

export function PublishBracketButton({ tournamentId, isReady }: Props) {
  const t = useTranslations('admin')
  const tButtons = useTranslations('buttons')
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  function handlePublish() {
    setShowConfirm(false)
    startTransition(async () => {
      const result = await publishTournamentAction(tournamentId)
      if (result.success) {
        toast.success(t('publish.toastSuccess'))
      } else {
        toast.error(result.error || t('publish.toastError'))
      }
    })
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isPending || !isReady}
        className={`${
          isReady
            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            : 'bg-slate-400 cursor-not-allowed opacity-70'
        } text-white font-black px-8 h-12 rounded-2xl shadow-lg transition-all active:scale-95 gap-2`}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-5 h-5" />
        )}
        {isPending ? t('publish.publishing') : t('publish.publishBracket')}
      </Button>
      {!isReady && (
        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1.5 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> {t('publish.fillRound1')}
        </p>
      )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">
              {t('publish.confirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t.rich('publish.confirmDesc', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
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
              onClick={handlePublish}
              className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
            >
              {t('publish.yesPublish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
