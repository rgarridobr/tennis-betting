import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TournamentForm } from '@/components/admin/tournament-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewTournamentPage() {
  return (
    <>
      <PageHero
        title="Novo Torneio"
        subtitle="Crie um novo Grand Slam com chaveamento de 128 jogadores"
      />

      <main className="container mx-auto px-4 py-8">
        <Button variant="outline" size="sm" asChild className="mb-6 bg-transparent">
          <Link href="/admin/torneios">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-900">Criar Torneio</CardTitle>
            <CardDescription>
              Preencha as informacoes do Grand Slam. O chaveamento com 127 partidas sera gerado automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentForm />
          </CardContent>
        </Card>
      </main>
    </>
  )
}
