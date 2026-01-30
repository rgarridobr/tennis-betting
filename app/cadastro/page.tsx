import { RegisterForm } from '@/components/auth/register-form'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RegisterPage() {
  const user = await getSession()
  if (user) redirect('/dashboard')
  
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
          <h1 className="text-2xl font-bold text-foreground mt-6">Criar sua conta</h1>
          <p className="text-muted-foreground mt-2">Comece a fazer seus palpites agora</p>
        </div>
        
        <RegisterForm />
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
