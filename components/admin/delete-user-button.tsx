'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { deleteUserAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DeleteUserButtonProps {
  userId: number
  userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUserAction(userId)
      if (result.success) {
        toast.success('Usuário excluído com sucesso!')
        setOpen(false)
      } else {
        toast.error('Erro ao excluir usuário')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 border border-red-200 shadow-sm mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-center">Excluir Usuário?</DialogTitle>
          <DialogDescription className="text-center text-lg font-medium text-slate-500 mt-2">
            Tem certeza que deseja excluir <strong>{userName}</strong>? Esta ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8 sm:justify-center gap-3 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-14 rounded-2xl border-2 border-slate-100 text-slate-500 font-black px-8 hover:bg-slate-50 transition-all w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black px-8 shadow-xl shadow-red-200 transition-all active:scale-95 w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Excluindo...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
