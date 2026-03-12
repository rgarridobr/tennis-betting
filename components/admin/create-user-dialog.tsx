'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserAction } from '@/lib/actions/admin';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Phone, Home } from 'lucide-react';
import { toast } from 'sonner';
import { formatBrazilianPhoneNumber } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateUserDialog() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tennisClub, setTennisClub] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [isNoneChecked, setIsNoneChecked] = useState(false);
  const [isFirstNameOnlyChecked, setIsFirstNameOnlyChecked] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (isFirstNameOnlyChecked) {
      setNickname(value.trim().split(' ')[0]);
    }
  };

  const handleFirstNameOnlyChange = (checked: boolean) => {
    setIsFirstNameOnlyChecked(checked);

    if (checked) {
      setNickname(name.trim().split(' ')[0]);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBrazilianPhoneNumber(e.target.value);
    setWhatsapp(formattedValue);
  };

  const handleNoneChange = (checked: boolean) => {
    setIsNoneChecked(checked);

    if (checked) {
      setTennisClub('Nenhum');
    } else {
      setTennisClub('');
    }
  };

  function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email.trim())) {
      toast.error('Por favor, insira um email válido.');
      return false;
    }

    return true;
  }

  function validatePassword(password: string) {
    if (password.length < 6) {
      toast.error('A senha deve conter pelo menos 6 caracteres.');
      return false;
    }

    return true;
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!validateEmail(email) || !validatePassword(password)) return;

    startTransition(async () => {
      const result = await createUserAction(formData);

      if (result.success) {
        toast.success('Usuário cadastrado com sucesso!');
        setOpen(false);
      } else {
        setError(result.error || 'Erro ao cadastrar usuário');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 h-14"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200">
            <UserPlus className="w-7 h-7 text-emerald-600" />
          </div>

          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-left">
            Novo Usuário
          </DialogTitle>

          <DialogDescription className="text-base font-medium text-slate-400 mt-1 text-left">
            Cadastre um novo participante para o bolão.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-5 rounded-2xl flex items-center gap-3 border-2 border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Nome */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
              <User className="w-4 h-4 text-emerald-500" /> Nome Completo (privado) *
            </Label>

            <Input
              name="name"
              value={name}
              onChange={handleNameChange}
              required
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          {/* Apelido */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
                <User className="w-4 h-4 text-emerald-500" /> Apelido (visível no site)
              </Label>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="first_name_only_admin"
                  checked={isFirstNameOnlyChecked}
                  onCheckedChange={handleFirstNameOnlyChange}
                />
                <label
                  htmlFor="first_name_only_admin"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
                >
                  Apenas o primeiro nome
                </label>
              </div>
            </div>

            <Input
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              readOnly={isFirstNameOnlyChecked}
              className={`h-12 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 ${
                isFirstNameOnlyChecked ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'
              }`}
            />
          </div>

          {/* Email */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
              <Mail className="w-4 h-4 text-emerald-500" /> Email
            </Label>

            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          {/* Senha */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
              <Lock className="w-4 h-4 text-emerald-500" /> Senha
            </Label>

            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mínimo de 6 caracteres</p>
          </div>

          {/* WhatsApp */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
              <Phone className="w-4 h-4 text-emerald-500" /> WhatsApp
            </Label>

            <Input
              name="whatsapp"
              value={whatsapp}
              onChange={handleWhatsappChange}
              maxLength={15}
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          {/* Clube */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest">
                <Home className="w-4 h-4 text-emerald-500" /> Clube
              </Label>

              <div className="flex items-center gap-2">
                <Checkbox id="none_club" checked={isNoneChecked} onCheckedChange={handleNoneChange} />
                <label
                  htmlFor="none_club"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer"
                >
                  Nenhum
                </label>
              </div>
            </div>

            <Input
              name="tennis_club"
              value={tennisClub}
              onChange={(e) => setTennisClub(e.target.value)}
              readOnly={isNoneChecked}
              required
              className={`h-12 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 ${
                isNoneChecked ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'
              }`}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black shadow-xl shadow-emerald-500/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Usuário'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
