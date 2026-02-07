import { Trophy } from 'lucide-react'
import type { User } from '@/lib/auth'

interface HeroSectionProps {
  user: User | null
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <div className="container mx-auto px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background image with green overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        <div className="relative px-6 py-12 sm:px-8 sm:py-16 md:px-10 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 mb-6 border border-white/10">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs tracking-wide">Bolão de Tênis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white text-balance tracking-tight">
            Faça seus palpites e{' '}
            <span className="text-emerald-400">ganhe pontos</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl mx-auto text-balance font-medium">
            Participe do bolão, dê seus palpites nos jogos e dispute com seus amigos no ranking
          </p>
          {user && (
            <p className="mt-3 text-sm text-white/70">
              Bem-vindo, <span className="font-medium text-white">{user.name}</span>!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
