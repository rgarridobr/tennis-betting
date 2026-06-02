'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StateCitySelector } from '@/components/shared/state-city-selector';
import { TennisClubSelector } from '@/components/shared/tennis-club-selector';
import { getTennisClubsAction } from '@/lib/actions/users';
import type { TennisClub } from '@/lib/data';
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
    tennis_club_id?: number | null;
    tennis_club_custom?: string | null;
    state?: string;
    city?: string;
  }
}

export function CompleteRegistrationForm({ user }: CompleteRegistrationFormProps) {
  const [state, setState] = useState(user.state || '');
  const [city, setCity] = useState(user.city || '');
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '');
  const [clubs, setClubs] = useState<TennisClub[]>([]);

  useEffect(() => {
    getTennisClubsAction().then(setClubs);
  }, []);

  async function handleSubmit(formData: FormData) {
    // Need to include existing fields because updateProfile requires them
    formData.append('name', user.name);
    if (user.nickname) formData.append('nickname', user.nickname);

    const result = await updateProfile(formData);
    if (result?.success) {
      toast.success('Perfil atualizado com sucesso!');
      window.location.href = '/dashboard';
    } else {
      toast.error(result?.error || 'Erro ao atualizar perfil');
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Complete seu Cadastro</DialogTitle>
          <DialogDescription>
            Para continuarmos, precisamos que você informe seu clube, estado e cidade.
            Isso nos ajudará a organizar torneios regionais no futuro!
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-6 pt-4">
          <TennisClubSelector
            clubs={clubs}
            value={tennisClub}
            onChange={setTennisClub}
            clubId={user.tennis_club_id}
            customClub={user.tennis_club_custom}
            required
          />

          <StateCitySelector
            selectedState={state}
            selectedCity={city}
            onStateChange={setState}
            onCityChange={setCity}
            required
          />

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
