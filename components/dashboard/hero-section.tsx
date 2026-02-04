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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/90 via-emerald-700/85 to-emerald-600/80" />
        
        <div className="relative px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 text-center">
          <div className="inline-flex items-center gap-2 text-white/90 mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold text-sm">Bolão de Tênis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-balance">
            Faça seus palpites e{' '}
            <span className="text-amber-400">ganhe pontos</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto text-balance">
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
