import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CompleteRegistrationForm } from '@/components/auth/complete-registration-form';
import { RotatingQuote } from '@/components/auth/rotating-quote';

export default async function CompleteRegistrationPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  // If already has state and city, go to dashboard
  if (user.state && user.city) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] container mx-auto px-4 md:px-32">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80"
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Falta pouco!</h1>
            <p className="text-slate-500 mt-3 font-medium text-lg">
              Precisamos de algumas informações adicionais para melhorar sua experiência.
            </p>
          </div>

          <CompleteRegistrationForm user={{
            name: user.name,
            nickname: user.nickname,
            tennis_club: user.tennis_club
          }} />
        </div>
      </div>
    </div>
  );
}
