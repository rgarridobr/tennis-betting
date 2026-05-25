'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { formatBrazilianPhoneNumber } from '@/lib/utils';
import { StateCitySelector } from '@/components/shared/state-city-selector';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Criando conta...' : 'Criar conta'}
    </Button>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [tennisClub, setTennisClub] = useState('');
  const [isNoneChecked, setIsNoneChecked] = useState(false);
  const [isFirstNameOnlyChecked, setIsFirstNameOnlyChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (isFirstNameOnlyChecked) {
      const firstName = value.trim().split(' ')[0];
      setNickname(firstName);
    }
  };

  const handleFirstNameOnlyChange = (checked: boolean) => {
    setIsFirstNameOnlyChecked(checked);
    if (checked) {
      const firstName = name.trim().split(' ')[0];
      setNickname(firstName);
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

  async function handleSubmit(formData: FormData) {
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    const result = await registerAction(formData);
    if (result?.error) {
      toast.error(result.error)
      setError(result.error);
    }
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();

    if (!emailRegex.test(cleanEmail)) {
      toast.error('Por favor, insira um email válido.');
      return false;
    }

    return true;
  }

  function validatePassword(password: string): boolean {
    if (password.length < 6) {
      toast.error('A senha deve conter pelo menos 6 caracteres.');
      return false;
    }
    return true;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo (privado) *</Label>
            <Input id="name" name="name" type="text" placeholder="" required value={name} onChange={handleNameChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nickname">Apelido (visível no site)</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first_name_only"
                  checked={isFirstNameOnlyChecked}
                  onCheckedChange={handleFirstNameOnlyChange}
                />
                <label
                  htmlFor="first_name_only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Apenas o primeiro nome
                </label>
              </div>
            </div>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder=""
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              readOnly={isFirstNameOnlyChecked}
              className={isFirstNameOnlyChecked ? 'bg-slate-50 cursor-not-allowed' : ''}
            />
            <p className="text-[10px] text-slate-400 font-bold px-1 italic">
              Seu nome real ficará privado, apenas este apelido será exibido publicamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <StateCitySelector
            selectedState={state}
            selectedCity={city}
            onStateChange={setState}
            onCityChange={setCity}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
                          <p className="text-[10px] text-slate-400 font-bold px-1 italic">Mínimo de 6 caracteres</p>

          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="text"
              placeholder=""
              value={whatsapp}
              onChange={handleWhatsappChange}
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tennis_club">Clube em que joga tênis *</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="no_club" checked={isNoneChecked} onCheckedChange={handleNoneChange} />
                <label
                  htmlFor="no_club"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Nenhum
                </label>
              </div>
            </div>
            <Input
              id="tennis_club"
              name="tennis_club"
              type="text"
              placeholder=""
              value={tennisClub}
              onChange={(e) => setTennisClub(e.target.value)}
              readOnly={isNoneChecked}
              className={isNoneChecked ? 'bg-slate-50 cursor-not-allowed' : ''}
              required
            />
          </div>

          <div className="text-[10px] text-slate-400 font-bold px-1 italic py-2">Campos com * são obrigatórios</div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
