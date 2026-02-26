'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserAction } from '@/lib/actions/admin'
import { UserPlus, Mail, User, AlertCircle, Loader2, Phone, Home, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatBrazilianPhoneNumber } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface EditUserDialogProps {
  user: {
    id: number
    name: string
    email: string
    nickname?: string
    whatsapp?: string
    tennis_club?: string
  }
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(user.name)
  const [nickname, setNickname] = useState(user.nickname || '')
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '')
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '')
  const [isNoneChecked, setIsNoneChecked] = useState(user.tennis_club?.toLowerCase() === 'nenhum')
  const [isFirstNameOnlyChecked, setIsFirstNameOnlyChecked] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (isFirstNameOnlyChecked) {
      const firstName = value.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const handleFirstNameOnlyChange = (checked: boolean) => {
    setIsFirstNameOnlyChecked(checked)
    if (checked) {
      const firstName = name.trim().split(' ')[0]
      setNickname(firstName)
    }
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBrazilianPhoneNumber(e.target.value)
    setWhatsapp(formattedValue)
  }

  const handleNoneChange = (checked: boolean) => {
    setIsNoneChecked(checked)
    if (checked) {
      setTennisClub('Nenhum')
    } else {
      setTennisClub(user.tennis_club || '')
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updateUserAction(user.id, formData)
      if (result.success) {
        toast.success('Usuário atualizado com sucesso!')
        setOpen(false)
      } else {
        setError(result.error || 'Erro ao atualizar usuário')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Pencil className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 shadow-sm">
            <Pencil className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-left">Editar Usuário</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-400 mt-1 text-left">
            Atualize as informações do participante.
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
              <Label htmlFor="edit-name" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <User className="w-3 h-3 text-emerald-500" /> Nome Completo (privado) *
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder=""
                required
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="edit-nickname" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                  <User className="w-3 h-3 text-emerald-500" /> Apelido (visível no site)
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-first_name_only"
                    checked={isFirstNameOnlyChecked}
                    onCheckedChange={handleFirstNameOnlyChange}
                    className="w-3 h-3 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <label
                    htmlFor="edit-first_name_only"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
                  >
                    Apenas o primeiro nome
                  </label>
                </div>
              </div>
              <Input
                id="edit-nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                readOnly={isFirstNameOnlyChecked}
                placeholder=""
                className={`h-12 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 ${isFirstNameOnlyChecked ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <Mail className="w-3 h-3 text-emerald-500" /> E-mail *
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder=""
                required
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest ml-1">
                <Phone className="w-3 h-3 text-emerald-500" /> WhatsApp
              </Label>
              <Input
                id="edit-whatsapp"
                name="whatsapp"
                placeholder=""
                value={whatsapp}
                onChange={handleWhatsappChange}
                maxLength={15}
                className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="edit-tennis_club" className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest">
                  <Home className="w-3 h-3 text-emerald-500" /> Clube em que joga tênis *
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-no_club"
                    checked={isNoneChecked}
                    onCheckedChange={handleNoneChange}
                    className="w-3 h-3 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <label
                    htmlFor="edit-no_club"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
                  >
                    Nenhum
                  </label>
                </div>
              </div>
              <Input
                id="edit-tennis_club"
                name="tennis_club"
                placeholder=""
                value={tennisClub}
                onChange={(e) => setTennisClub(e.target.value)}
                readOnly={isNoneChecked}
                required
                className={`h-12 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 ${isNoneChecked ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">
            Campos com * são obrigatórios
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
                  Salvando...
                </>
              ) : (
                <>
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
