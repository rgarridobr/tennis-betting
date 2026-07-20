'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StateCitySelector } from '@/components/shared/state-city-selector';
import { TennisClubSelector } from '@/components/shared/tennis-club-selector';
import { CountrySelector } from '@/components/shared/country-selector';
import { getTennisClubsAction } from '@/lib/actions/users';
import type { TennisClub } from '@/lib/data';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('auth');
  return (
    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
      {pending ? t('completeSubmitting') : t('completeSubmit')}
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
    country?: string;
    state?: string;
    city?: string;
  }
}

export function CompleteRegistrationForm({ user }: CompleteRegistrationFormProps) {
  const t = useTranslations('auth');
  const [country, setCountry] = useState(user.country || '');
  const [state, setState] = useState(user.state || '');
  const [city, setCity] = useState(user.city || '');
  const [tennisClub, setTennisClub] = useState(user.tennis_club || '');
  const [clubs, setClubs] = useState<TennisClub[]>([]);

  const isBrazil = ['brasil', 'brazil'].includes(country.trim().toLowerCase());

  useEffect(() => {
    getTennisClubsAction().then(setClubs);
  }, []);

  async function handleSubmit(formData: FormData) {
    // Need to include existing fields because updateProfile requires them
    formData.append('name', user.name);
    if (user.nickname) formData.append('nickname', user.nickname);

    const result = await updateProfile(formData);
    if (result?.success) {
      toast.success(t('completeSuccess'));
      window.location.href = '/';
    } else {
      toast.error(result?.error || t('completeError'));
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">{t('completeTitle')}</DialogTitle>
          <DialogDescription>
            {t('completeDescription')}
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

          <CountrySelector
            selectedCountry={country}
            onCountryChange={(value) => {
              setCountry(value)
              if (!['brasil', 'brazil'].includes(value.trim().toLowerCase())) {
                setState('')
                setCity('')
              }
            }}
            required
          />

          {isBrazil ? (
            <StateCitySelector
              selectedState={state}
              selectedCity={city}
              onStateChange={setState}
              onCityChange={setCity}
              required
            />
          ) : (
            <p className="text-sm text-slate-500">{t('nonBrazilHint')}</p>
          )}

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
