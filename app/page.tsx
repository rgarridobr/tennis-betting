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
  Medal,
  Calendar,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
  CheckCircle2,
  MapPin
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-semibold">
            <Trophy className="w-6 h-6" />
            <span className="hidden sm:inline">Bolão de Tênis</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="bg-emerald-500 text-white hover:bg-emerald-600" asChild>
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-emerald-800/90 to-teal-900/85" />
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div>
                <Badge className="bg-amber-400/20 text-amber-300 hover:bg-amber-400/20 mb-6 px-4 py-2 text-sm border border-amber-400/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Roland Garros 2025 ao vivo!
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] text-balance">
                  Faça seus palpites e{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">ganhe pontos</span>
                </h1>
                
                <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed">
                  Participe do bolão, dê seus palpites nos maiores torneios de tênis do mundo e dispute com seus amigos no ranking.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg h-14 px-8 shadow-lg shadow-emerald-500/30" asChild>
                    <Link href="/cadastro">
                      Começar agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white text-lg h-14 px-8 bg-white/5" asChild>
                    <Link href="/login">Já tenho uma conta</Link>
                  </Button>
                </div>
                
                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap items-center gap-6 text-white/60 text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Cadastro gratuito
                  </span>
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Pagamento seguro
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    500+ participantes
                  </span>
                </div>
              </div>
              
              {/* Right content - Stats cards */}
              {/* <div className="hidden lg:block">
                <div className="relative">
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <p className="text-white/60 text-sm uppercase tracking-wider">Prêmio acumulado</p>
                        <p className="text-5xl font-bold text-white mt-2">R$ 5.250</p>
                        <p className="text-emerald-400 text-sm mt-1">Roland Garros 2025</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">127</p>
                          <p className="text-white/60 text-xs mt-1">Participantes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">64</p>
                          <p className="text-white/60 text-xs mt-1">Partidas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-amber-400">10</p>
                          <p className="text-white/60 text-xs mt-1">Pts/acerto</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="absolute -top-6 -left-6 bg-white shadow-xl border-0 animate-pulse">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">1o lugar</p>
                        <p className="font-bold text-slate-900">R$ 2.625</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="absolute -bottom-4 -right-4 bg-white shadow-xl border-0">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Acertos</p>
                        <p className="font-bold text-slate-900">85%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>*/}
            </div> 
          </div> 
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs uppercase tracking-wider">Role para ver mais</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* Featured Tournaments */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
                  Torneios
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Torneios em destaque
                </h2>
                <p className="text-slate-600 mt-2 text-lg">Inscreva-se e comece a fazer seus palpites</p>
              </div>
              <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 self-start sm:self-auto bg-transparent" asChild>
                <Link href="/cadastro">
                  Ver todos os torneios
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {featuredTournaments.map((tournament) => (
                <Card key={tournament.id} className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                  <div className="relative h-52">
                    <img
                      src={
                        tournament.surface === 'clay' 
                          ? 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80'
                          : tournament.surface === 'grass'
                            ? 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80'
                            : 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80'
                      }
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm mb-2">
                        {tournament.surface === 'clay' ? 'Saibro' : tournament.surface === 'grass' ? 'Grama' : 'Quadra dura'}
                      </Badge>
                      <h3 className="text-2xl font-bold text-white">{tournament.name}</h3>
                      <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tournament.location}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {new Date(tournament.end_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Taxa de inscrição</p>
                        <p className="text-lg font-bold text-emerald-600">R$ {tournament.entry_fee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-slate-50">
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Users,
                  color: 'bg-blue-500',
                  lightColor: 'bg-blue-50',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  title: 'Crie sua conta',
                  description: 'Cadastre-se gratuitamente em menos de 1 minuto.',
                },
                {
                  icon: Trophy,
                  color: 'bg-amber-500',
                  lightColor: 'bg-amber-50',
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600',
                  title: 'Escolha o torneio',
                  description: 'Pague a taxa de inscrição para entrar no bolão.',
                },
                {
                  icon: Target,
                  color: 'bg-emerald-500',
                  lightColor: 'bg-emerald-50',
                  iconBg: 'bg-emerald-100',
                  iconColor: 'text-emerald-600',
                  title: 'Faça seus palpites',
                  description: 'Escolha o vencedor de cada partida do torneio.',
                },
                {
                  icon: Medal,
                  color: 'bg-violet-500',
                  lightColor: 'bg-violet-50',
                  iconBg: 'bg-violet-100',
                  iconColor: 'text-violet-600',
                  title: 'Ganhe prêmios',
                  description: 'Acerte os resultados e leve o prêmio do bolão!',
                },
              ].map((item, index) => (
                <div key={item.title} className="relative">
                  
                  <Card className={`border-0 shadow-lg hover:shadow-xl transition-all h-full ${item.lightColor} hover:-translate-y-1`}>
                    <CardContent className="p-6">
                      {/* Step number */}
                      <div className={`w-8 h-8 rounded-full ${item.color} text-white text-sm font-bold flex items-center justify-center mb-4`}>
                        {index + 1}
                      </div>
                      
                      {/* Icon */}
                      {/* <div className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                        <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                      </div> */}
                      
                      {/* Content */}
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* CTA */}
            <div className="mt-16 text-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg h-14 px-8 shadow-lg shadow-emerald-600/30" asChild>
                <Link href="/cadastro">
                  Começar agora - É grátis!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials / Social proof */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 mb-4">
                Depoimentos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                O que dizem nossos participantes
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Carlos Silva',
                  role: 'Participante desde 2026',
                  content: 'Já ganhei dois bolões! A plataforma é muito fácil de usar e os pagamentos são rápidos.',
                  avatar: 'CS',
                },
                {
                  name: 'Ana Rodrigues',
                  role: 'Participante desde 2026',
                  content: 'Adoro acompanhar os torneios e fazer palpites. Muito divertido competir com amigos!',
                  avatar: 'AR',
                },
                {
                  name: 'Pedro Santos',
                  role: 'Participante desde 2026',
                  content: 'A melhor plataforma de bolão de tênis. Interface limpa e funcionalidades incríveis.',
                  avatar: 'PS',
                },
              ].map((testimonial) => (
                <Card key={testimonial.name} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-teal-900/95" />
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-balance">
                Pronto para entrar no jogo?
              </h2>
              <p className="text-emerald-100 text-lg mb-8">
                Crie sua conta grátis agora e participe do bolão do Roland Garros 2025. 
                O torneio já começou e os prêmios estão te esperando!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 text-lg h-14 px-10 shadow-lg" asChild>
                  <Link href="/cadastro">
                    Criar minha conta grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white text-lg h-14 px-8 bg-transparent" asChild>
                  <Link href="/login">Já tenho uma conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <span>Bolão de Tênis</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                Faça seus palpites e ganhe pontos nos maiores torneios de tênis do mundo. 
                Divirta-se competindo com amigos!
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/cadastro" className="hover:text-white transition-colors">Criar conta</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Como funciona</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Termos de uso</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>2025 Bolão de Tênis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
