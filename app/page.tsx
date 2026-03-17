import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  MapPin,
} from 'lucide-react';
import { getTournaments, getTournamentsByYearAndMonth } from '@/lib/data';
import { TournamentCard } from '@/components/dashboard/tournament-card';

export default async function HomePage() {
  const user = await getSession();
  if (user) {
    if (user.is_admin) {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }

  const currentDate = new Date();
  const allTournaments = await getTournamentsByYearAndMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
  const featuredTournaments = allTournaments.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 md:px-32 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-emerald-600 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline font-black text-xl tracking-tight text-slate-900">Bolão de Tênis</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="font-bold text-slate-600 hover:text-emerald-600 rounded-xl">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-6 rounded-xl shadow-lg shadow-emerald-100"
              asChild
            >
              <Link href="/cadastro">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="container mx-auto px-4 md:px-32 pt-6">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1530915534664-4ac6423816b7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
              }}
            />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80" />

            <div className="relative px-8 py-20 md:px-16 w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12">
              <div className="m-w-4xl">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight text-balance">
                  Faça seus palpites e <span className="text-emerald-400">ganhe pontos</span>
                </h1>

                <p className="mt-8 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed font-medium">
                  Participe do bolão, dê seus palpites nos maiores torneios de tênis do mundo e dispute com seus amigos
                  no ranking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg h-16 px-10 rounded-2xl shadow-xl shadow-emerald-500/20 font-black transition-all hover:-translate-y-1"
                  asChild
                >
                  <Link href="/cadastro">
                    Criar minha conta
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white text-lg h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-md font-bold transition-all hover:-translate-y-1"
                  asChild
                >
                  <Link href="/login">Fazer login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Tournaments */}
        <section className="py-12 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Torneios em destaque</h2>
                </div>
                <p className="text-slate-500 text-lg font-medium">
                  Inscreva-se e comece a fazer seus palpites agora mesmo
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl px-6"
                asChild
              >
                <Link href="/login" className="flex items-center gap-2">
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-[#f8fafc]">
          <div className="container mx-auto px-4 md:px-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
                <Target className="w-4 h-4" />
                <span className="font-bold text-xs tracking-wide uppercase">Simples e rápido</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Como funciona</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  color: 'bg-emerald-500',
                  iconColor: 'text-emerald-500',
                  title: 'Crie sua conta',
                  description: 'Cadastre-se gratuitamente em menos de 1 minuto e entre no jogo.',
                },
                {
                  icon: Trophy,
                  color: 'bg-emerald-500',
                  title: 'Escolha o torneio',
                  description: 'Selecione o torneio ativo que deseja participar do bolão.',
                },
                {
                  icon: Target,
                  color: 'bg-emerald-500',
                  title: 'Faça seus palpites',
                  description: 'Escolha o vencedor de cada partida e acumule pontos por acerto.',
                },
                {
                  icon: Medal,
                  color: 'bg-emerald-500',
                  title: 'Suba no Ranking',
                  description: 'Dispute o topo do ranking global com outros participantes.',
                },
              ].map((item, index) => (
                <Card
                  key={item.title}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-white group hover:-translate-y-1"
                >
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{item.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                      <span className="w-8 h-[2px] bg-emerald-100" />
                      Passo 0{index + 1}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 mb-4 border border-amber-100">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="font-bold text-xs tracking-wide uppercase">Depoimentos</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight text-balance">
                O que dizem nossos participantes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Carlos Silva',
                  role: 'Participante desde 2026',
                  content:
                    'A plataforma é incrível! Interface intuitiva e acompanhar o ranking em tempo real dá um gás a mais na competição.',
                  avatar: 'CS',
                },
                {
                  name: 'Ana Rodrigues',
                  role: 'Participante desde 2026',
                  content:
                    'Adoro a facilidade de dar os palpites. O sistema de pontos é justo e muito divertido de competir com os amigos.',
                  avatar: 'AR',
                },
                {
                  name: 'Pedro Santos',
                  role: 'Participante desde 2026',
                  content:
                    'Melhor bolão de tênis que já participei. Todo Grand Slam eu tô aqui firme e forte. Recomendo demais!',
                  avatar: 'PS',
                },
              ].map((testimonial) => (
                <Card key={testimonial.name} className="border-0 shadow-xl rounded-[2.5rem] bg-slate-50/50">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-8 leading-relaxed font-medium italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500 font-bold">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 py-20 px-8 text-center">
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent" />

              <div className="relative max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 text-balance tracking-tight">
                  Pronto para entrar no jogo?
                </h2>
                <p className="text-emerald-100/80 text-lg mb-10 font-medium">
                  Cadastre-se agora e comece a pontuar nos maiores torneios do tênis mundial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg h-16 px-12 rounded-2xl shadow-xl shadow-emerald-500/20 font-black transition-all hover:-translate-y-1"
                    asChild
                  >
                    <Link href="/cadastro">Quero me cadastrar</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white text-lg h-16 px-10 rounded-2xl bg-white/5 backdrop-blur-md font-bold transition-all hover:-translate-y-1"
                    asChild
                  >
                    <Link href="/login">Já tenho uma conta</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10">
        <div className="container mx-auto px-4 md:px-32">
          {/* <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 text-white mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-2xl tracking-tight">Bolão de Tênis</span>
              </Link>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                A plataforma definitiva para fãs de tênis. Faça seus palpites, acompanhe os resultados ao vivo e dispute o topo do ranking mundial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/cadastro" className="hover:text-white transition-colors">
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Como funciona
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
          </div> */}

          <div className="text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} TennisPool. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
