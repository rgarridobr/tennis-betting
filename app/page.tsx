import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Target, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Zap,
  Medal,
  Calendar,
  ArrowRight
} from 'lucide-react'
import { getLiveTournaments, getUpcomingTournaments } from '@/lib/data'

export default async function HomePage() {
  const user = await getSession()
  if (user) redirect('/dashboard')
  
  const [liveTournaments, upcomingTournaments] = await Promise.all([
    getLiveTournaments(),
    getUpcomingTournaments(),
  ])
  
  const featuredTournaments = [...liveTournaments, ...upcomingTournaments].slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Trophy className="w-7 h-7" />
            <span>Bolão de Tênis</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:bg-white/20" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="bg-white text-emerald-700 hover:bg-white/90" asChild>
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-teal-900/85" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 pt-20">
            <div className="max-w-3xl">    
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance">
                Faça seus palpites e{' '}
                <span className="text-amber-400">ganhe pontos</span>
              </h1>
              
              <p className="mt-6 text-xl text-white/80 max-w-xl leading-relaxed">
                Participe do bolão, dê seus palpites nos maiores torneios de tênis do mundo e dispute com seus amigos no ranking.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-amber-400 text-white hover:text-white hover:bg-amber-300 text-lg h-14 px-8" asChild>
                  <Link href="/cadastro">
                    Começar agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg h-14 px-8 bg-transparent hover:text-white" asChild>
                  <Link href="/login">Já tenho uma conta</Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
                <div>
                  <p className="text-4xl font-bold text-white">500+</p>
                  <p className="text-white/60 text-sm mt-1">Participantes</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">12</p>
                  <p className="text-white/60 text-sm mt-1">Torneios</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-amber-400">R$5k+</p>
                  <p className="text-white/60 text-sm mt-1">Em prêmios</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tournaments */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Torneios em destaque
                </h2>
                <p className="text-slate-600 mt-2">Inscreva-se e comece a fazer seus palpites</p>
              </div>
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-transparent" asChild>
                <Link href="/cadastro">
                  Ver todos
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredTournaments.map((tournament) => (
                <Card key={tournament.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="relative h-48">
                    <img
                      src={
                        tournament.surface === 'clay' 
                          ? 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80'
                          : tournament.surface === 'grass'
                            ? 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80'
                            : 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80'
                      }
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:scale-105 transition-transform duration-300"  />
                    <Badge 
                      className={`absolute top-4 right-4 ${
                        tournament.status === 'live' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-400 text-amber-900'
                      }`}
                    >
                      {tournament.status === 'live' ? 'Ao vivo' : 'Em breve'}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{tournament.location}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                        <Badge variant="secondary">
                          {tournament.surface === 'clay' ? 'Saibro' : tournament.surface === 'grass' ? 'Grama' : 'Quadra dura'}
                        </Badge>
                      </div>
                      <span className="text-emerald-600 font-semibold">
                        R${tournament.entry_fee}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
                Simples e rápido
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Como funciona
              </h2>
              <p className="text-slate-600 mt-3 text-lg max-w-md mx-auto">
                Em apenas 4 passos você começa a competir pelos prêmios
              </p>
            </div>
            
            <div className="relative">
              <div className="grid md:grid-cols-4 gap-8 md:gap-6">
                {[
                  {
                    icon: Users,
                    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    shadowColor: 'shadow-blue-500/30',
                    lightBg: 'bg-blue-50',
                    step: '01',
                    title: 'Crie sua conta',
                    description: 'Cadastre-se gratuitamente em menos de 1 minuto e acesse a plataforma.',
                  },
                  {
                    icon: Trophy,
                    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
                    shadowColor: 'shadow-amber-500/30',
                    lightBg: 'bg-amber-50',
                    step: '02',
                    title: 'Escolha o torneio',
                    description: 'Pague a taxa de inscrição para entrar no bolão do torneio desejado.',
                  },
                  {
                    icon: Target,
                    color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
                    shadowColor: 'shadow-emerald-500/30',
                    lightBg: 'bg-emerald-50',
                    step: '03',
                    title: 'Faça seus palpites',
                    description: 'Escolha o vencedor de cada partida antes do jogo começar.',
                  },
                  {
                    icon: Medal,
                    color: 'bg-gradient-to-br from-violet-500 to-purple-600',
                    shadowColor: 'shadow-violet-500/30',
                    lightBg: 'bg-violet-50',
                    step: '04',
                    title: 'Ganhe prêmios',
                    description: 'Acerte os resultados, suba no ranking e leve o prêmio do bolão!',
                  },
                ].map((item, index) => (
                  <div key={item.title} className="relative group">
                    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full ${item.lightBg} group-hover:-translate-y-2`}>
                      <CardContent className="p-6 text-center">
                        {/* Step number badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${item.color} shadow-lg ${item.shadowColor}`}>
                            {index + 1}
                          </span>
                        </div>
                        
                        {/* Icon */}
                        <div className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center mx-auto mt-4 mb-5 shadow-xl ${item.shadowColor}`}>
                          <item.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        {/* Content */}
                        <h3 className="font-bold text-slate-900 text-xl mb-3">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                    
                    {/* Arrow connector - hidden on mobile and last item */}
                    {index < 3 && (
                      <div className="hidden md:flex absolute top-24 -right-6 z-10 w-6 h-6 rounded-full bg-white shadow-md items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA below steps */}
            <div className="mt-16 text-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg h-14 px-8" asChild>
                <Link href="/cadastro">
                  Começar agora - É grátis!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-emerald-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-50" />
          
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para competir?
            </h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
              Crie sua conta agora e participe do bolão do Roland Garros 2025. 
              O torneio já começou!
            </p>
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 text-lg h-14 px-10" asChild>
              <Link href="/cadastro">
                Criar minha conta grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Trophy className="w-6 h-6" />
              <span>Bolão de Tênis</span>
            </div>
            <p className="text-slate-400 text-sm">
              Faça seus palpites e ganhe pontos nos maiores torneios de tênis do mundo.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">Termos</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-white transition-colors">Contato</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
