import { RegisterForm } from '@/components/auth/register-form'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { Trophy } from 'lucide-react'

export default async function RegisterPage() {
  const user = await getSession()
  if (user) redirect('/dashboard')
  
  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80" 
          alt="Tennis Professional" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-3 text-white font-black text-4xl tracking-tighter mb-4">
            <Trophy className="w-10 h-10" />
            <span>BOLÃO</span>
          </div>
          <p className="text-white/90 text-xl font-medium max-w-md">
            "A vitória pertence àqueles que acreditam nela por mais tempo."
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex lg:hidden items-center gap-2 text-emerald-600 font-black text-2xl tracking-tighter mb-8">
              <Trophy className="w-8 h-8" />
              <span>BOLÃO</span>
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Criar sua conta</h1>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              Junte-se a milhares de fãs e comece a pontuar agora mesmo.
            </p>
          </div>
          
          <RegisterForm />
          
          <p className="text-center text-slate-500 font-medium">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-emerald-600 font-black hover:underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
