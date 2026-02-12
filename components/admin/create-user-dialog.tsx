'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUserAction } from '@/lib/actions/admin'
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
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

export function CreateUserDialog() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createUserAction(formData)
      if (result.success) {
        toast.success('Usuário cadastrado com sucesso!')
        setOpen(false)
      } else {
        setError(result.error || 'Erro ao cadastrar usuário')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-600 text-white hover:bg-emerald-700 font-black rounded-2xl px-8 shadow-lg shadow-emerald-200 w-full md:w-auto"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md overflow-hidden p-0">
        <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 shadow-sm">
            <UserPlus className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-left">Novo Usuário</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-400 mt-1 text-left">
            Cadastre um novo participante para o bolão.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-4 rounded-2xl flex items-center gap-3 border-2 border-red-100 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <User className="w-3 h-3 text-emerald-500" /> Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: João Silva"
                required
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <Mail className="w-3 h-3 text-emerald-500" /> E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@exemplo.com"
                required
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <Lock className="w-3 h-3 text-emerald-500" /> Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
              <p className="text-[10px] text-slate-400 font-bold px-1 italic">Mínimo de 6 caracteres</p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white gap-3 text-lg font-black shadow-xl shadow-emerald-200 transition-all active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Cadastrar Usuário
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
