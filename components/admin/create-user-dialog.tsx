'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StateCitySelector } from '@/components/shared/state-city-selector';
import { TennisClubSelector } from '@/components/shared/tennis-club-selector';
import { CountrySelector } from '@/components/shared/country-selector';
import { createUserAction } from '@/lib/actions/admin';
import type { TennisClub } from '@/lib/data';
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

export function CreateUserDialog({ clubs }: { clubs: TennisClub[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tennisClub, setTennisClub] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const isBrazil = ['brasil', 'brazil'].includes(country.trim().toLowerCase());

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
    const nextValue = e.target.value;
    setWhatsapp(isBrazil ? formatBrazilianPhoneNumber(nextValue) : nextValue);
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

    const email = (formData.get('email') as string | null)?.trim() ?? '';
    const password = (formData.get('password') as string | null)?.trim() ?? '';
    const country = (formData.get('country') as string | null)?.trim() || 'Brasil';
    const state = (formData.get('state') as string | null)?.trim() ?? '';
    const city = (formData.get('city') as string | null)?.trim() ?? '';
    const isBrazil = ['brasil', 'brazil'].includes(country.toLowerCase());

    if (!validateEmail(email) || !validatePassword(password)) return;
    if (isBrazil && (!state || !city)) {
      const message = 'Estado e cidade são obrigatórios para Brasil.';
      toast.error(message);
      setError(message);
      return;
    }

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
            Cadastre um novo participante para o grupo.
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
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          <CountrySelector
            selectedCountry={country}
            onCountryChange={(value) => {
              const nextCountry = value.trim();
              setCountry(nextCountry);

              if (!['brasil', 'brazil'].includes(nextCountry.toLowerCase())) {
                setState('');
                setCity('');
                setWhatsapp((current) => current.replace(/[^+\d]/g, ''));
              }
            }}
            required
          />

          {/* Estado e Cidade */}
          <div className="space-y-4">
            {isBrazil ? (
              <StateCitySelector
                selectedState={state}
                selectedCity={city}
                onStateChange={setState}
                onCityChange={setCity}
                required
              />
            ) : (
              <p className="text-sm text-slate-500">Para outros países, estado e cidade não são necessários.</p>
            )}
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

          <TennisClubSelector clubs={clubs} value={tennisClub} onChange={setTennisClub} label="Clube *" required />

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
