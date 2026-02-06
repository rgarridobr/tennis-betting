import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-semibold text-xl">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10" strokeDasharray="4 2" />
            </svg>
            Bolão de Tênis
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-6">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-2">Entre na sua conta para continuar</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
