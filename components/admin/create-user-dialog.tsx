'use client'

import { useState } from 'react'
import { Plus, UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminRegisterUserAction } from '@/lib/actions/admin'
import { toast } from 'sonner'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await adminRegisterUserAction(formData)

    setIsLoading(false)

    if (result.success) {
      toast.success('Usuário cadastrado com sucesso!')
      setOpen(false)
    } else {
      toast.error(result.error || 'Erro ao cadastrar usuário')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-600 text-white hover:bg-emerald-700 font-black rounded-2xl px-8 shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Cadastrar Novo Usuário</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Preencha os dados abaixo para adicionar um novo participante ao bolão.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: João Silva"
              required
              className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="joao@exemplo.com"
              required
              className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Senha Temporária</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Mínimo de 6 caracteres</p>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Finalizar Cadastro'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
