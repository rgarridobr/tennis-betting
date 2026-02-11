import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Trophy } from 'lucide-react';
import { RotatingQuote } from '@/components/auth/rotating-quote';

export default async function LoginPage() {
  const user = await getSession();
  if (user) {
    if (user.is_admin) {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80"
          alt="Tennis Professional"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-emerald-900/50 to-emerald-800/30" />

        <div className="absolute bottom-14 left-14 right-14 space-y-6">
          <RotatingQuote />
          <span className="text-emerald-200/80 text-sm tracking-wide uppercase">Viva o jogo</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-slate-500 mt-3 font-medium text-lg">Entre na sua conta para continuar seus palpites.</p>
          </div>

          <LoginForm />

          <p className="text-center text-slate-500 font-medium">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="text-emerald-600 font-black hover:underline underline-offset-4">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
