import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { getAthletes, getBracketEntries } from '@/lib/actions/bracket'
import { AdminHeader } from '@/components/admin/admin-header'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BracketView } from '@/components/admin/bracket-view'
import { InitializeBracketButton } from '@/components/admin/initialize-bracket-button'

async function getTournament(id: number) {
  const tournaments = await sql`
    SELECT * FROM tournaments WHERE id = ${id}
  `
  return tournaments[0] || null
}

export default async function TournamentBracketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect('/login')
  if (!user.is_admin) redirect('/dashboard')

  const tournament = await getTournament(Number(id))
  if (!tournament) notFound()

  const athletes = await getAthletes()
  const bracketEntries = await getBracketEntries(tournament.id)

  const roundNames: Record<number, string> = {
    1: '1st Round',
    2: '2nd Round',
    3: '3rd Round',
    4: 'Oitavas',
    5: 'Quartas',
    6: 'Semifinal',
    7: 'Final',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} />
      
      <PageHero 
        title={tournament.name} 
        subtitle="Gerencie o chaveamento do torneio"
      >
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/chaveamento"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <Badge 
            variant="outline" 
            className="bg-white/10 text-white border-white/20"
          >
            {tournament.status === 'live' ? 'Ao Vivo' : 
             tournament.status === 'upcoming' ? 'Em Breve' : 'Finalizado'}
          </Badge>
        </div>
      </PageHero>
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Total de Partidas</p>
              <p className="text-2xl font-bold text-slate-900">{bracketEntries.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Definidas</p>
              <p className="text-2xl font-bold text-emerald-600">
                {bracketEntries.filter(e => e.player1_id && e.player2_id).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Com Resultado</p>
              <p className="text-2xl font-bold text-amber-600">
                {bracketEntries.filter(e => e.winner_id).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Atletas Disponíveis</p>
              <p className="text-2xl font-bold text-slate-700">{athletes.length}</p>
            </CardContent>
          </Card>
        </div>

        {bracketEntries.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Chaveamento não inicializado
              </h3>
              <p className="text-slate-500 mb-6">
                Clique no botão abaixo para criar as 64 partidas da 1ª rodada
              </p>
              <InitializeBracketButton tournamentId={tournament.id} />
            </CardContent>
          </Card>
        ) : (
          <BracketView 
            tournamentId={tournament.id}
            entries={bracketEntries} 
            athletes={athletes}
            roundNames={roundNames}
          />
        )}
      </main>
    </div>
  )
}
