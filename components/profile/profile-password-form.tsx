'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword } from '@/lib/actions/profile';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProfilePasswordForm() {
  const t = useTranslations('profile');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handlePasswordSubmit(formData: FormData) {
    setIsPasswordLoading(true);
    setPasswordMessage(null);

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('passwordMismatch') });
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t('passwordMinLength') });
      setIsPasswordLoading(false);
      return;
    }

    try {
      const result = await updatePassword(formData);
      if (result.success) {
        setPasswordMessage({ type: 'success', text: t('passwordSuccess') });
        // Clear password fields
        const form = document.getElementById('password-form-sidebar') as HTMLFormElement;
        form?.reset();
      } else {
        setPasswordMessage({ type: 'error', text: result.error || t('passwordError') });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: t('passwordError') });
    } finally {
      setIsPasswordLoading(false);
    }
  }

  return (
    <form id="password-form-sidebar" action={handlePasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
        <Input id="currentPassword" name="currentPassword" type="password" placeholder="" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('newPassword')}</Label>
        <Input id="newPassword" name="newPassword" type="password" placeholder="" required minLength={6} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="" required minLength={6} />
      </div>

      {passwordMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {passwordMessage.text}
        </div>
      )}

      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPasswordLoading}>
        {isPasswordLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('updating')}
          </>
        ) : (
          t('changePassword')
        )}
      </Button>
    </form>
  );
}
