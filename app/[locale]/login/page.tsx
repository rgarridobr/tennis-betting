import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

import { ArrowLeft } from 'lucide-react';
import { RotatingQuote } from '@/components/auth/rotating-quote';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const user = await getSession();
  if (user) {
    if (redirectTo) {
      redirect(redirectTo);
    } else if (user.is_admin) {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  const t = await getTranslations('auth');
  const tUi = await getTranslations('ui');

  return (
    <div className="min-h-screen flex bg-[#f8fafc] container mx-auto px-4 md:px-32">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80"
          alt={tUi('imageAltTennis')}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-emerald-900/50 to-emerald-800/30" />

        <div className="absolute bottom-14 left-14 right-14 space-y-6">
          <RotatingQuote />
          <span className="text-emerald-200/80 text-sm tracking-wide uppercase">{t('tagline')}</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <LanguageSwitcher tone="light" />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('loginTitle')}</h1>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              {t('loginSubtitle')}
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-slate-500 font-medium">
            {t('noAccount')}{' '}
            <Link 
              href={redirectTo ? `/cadastro?redirectTo=${encodeURIComponent(redirectTo)}` : "/cadastro"} 
              className="text-emerald-600 font-black hover:underline underline-offset-4"
            >
              {t('signUpLink')}
            </Link>
          </p>

          <p className="text-center text-slate-500 font-medium">
            <Link href="/" className="text-emerald-600 font-black hover:underline underline-offset-4">
              <ArrowLeft className="inline-block mr-1" size={16} />
              {t('backToHome')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
