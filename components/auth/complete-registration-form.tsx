'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StateCitySelector } from '@/components/shared/state-city-selector';
import { toast } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar e Continuar'}
    </Button>
  );
}

interface CompleteRegistrationFormProps {
  user: {
    name: string;
    nickname?: string;
    tennis_club?: string;
  }
}

export function CompleteRegistrationForm({ user }: CompleteRegistrationFormProps) {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  async function handleSubmit(formData: FormData) {
    // Need to include existing fields because updateProfile requires them
    formData.append('name', user.name);
    if (user.nickname) formData.append('nickname', user.nickname);
    if (user.tennis_club) formData.append('tennis_club', user.tennis_club);

    const result = await updateProfile(formData);
    if (result?.success) {
      toast.success('Perfil atualizado com sucesso!');
      window.location.href = '/dashboard';
    } else {
      toast.error(result?.error || 'Erro ao atualizar perfil');
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900">Complete seu Cadastro</CardTitle>
        <CardDescription>
          Para continuarmos, precisamos que você informe seu estado e cidade.
          Isso nos ajudará a organizar torneios regionais no futuro!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <StateCitySelector
            selectedState={state}
            selectedCity={city}
            onStateChange={setState}
            onCityChange={setCity}
            required
          />

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
