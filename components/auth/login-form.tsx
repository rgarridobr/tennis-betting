'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ResetPasswordDialog } from './reset-password-dialog';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('auth');
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t('loginSubmitting') : t('loginSubmit')}
    </Button>
  );
}

export function LoginForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';
  const [error, setError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="pt-2">
        <form action={handleSubmit} className="space-y-4">
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="text" placeholder="" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" name="password" type="password" placeholder="" required />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setResetDialogOpen(true)}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>

          <SubmitButton />
        </form>

        <ResetPasswordDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen} />
      </CardContent>
    </Card>
  );
}
