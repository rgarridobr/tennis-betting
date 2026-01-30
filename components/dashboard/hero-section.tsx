import { Trophy } from 'lucide-react'
import type { User } from '@/lib/auth'

interface HeroSectionProps {
  user: User | null
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden py-16 md:py-22">
      {/* Background image with green overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/90 via-emerald-700/85 to-emerald-600/80" />
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 text-white/90 mb-4">
          <Trophy className="w-5 h-5" />
          <span className="font-semibold text-sm">Bolão de Tênis</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
          Faça seus palpites e{' '}
          <span className="text-amber-400">ganhe pontos</span>
        </h1>
        <p className="mt-4 text-white/80 max-w-xl mx-auto text-balance">
          Participe do bolão, dê seus palpites nos jogos e dispute com seus amigos no ranking
        </p>
        {user && (
          <p className="mt-4 text-sm text-white/70">
            Bem-vindo, <span className="font-medium text-white">{user.name}</span>!
          </p>
        )}
      </div>
    </div>
  )
}
