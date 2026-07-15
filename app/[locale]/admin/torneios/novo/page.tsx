import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TournamentForm } from '@/components/admin/tournament-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTournamentNames, getTournamentLocations } from '@/lib/data'
import { getTranslations } from 'next-intl/server'

export default async function NewTournamentPage() {
  const [names, locations] = await Promise.all([
    getTournamentNames(),
    getTournamentLocations()
  ])
  const t = await getTranslations('admin')
  const tButtons = await getTranslations('buttons')

  return (
    <>
      <PageHero
        title={t('newTournament')}
        subtitle={t('newTournamentSubtitle')}
      />

      <main className="container mx-auto px-4 md:px-32 py-12">
        <Button variant="outline" size="sm" asChild className="mb-8 rounded-xl font-bold border-2 bg-white">
          <Link href="/admin/torneios">
            <ArrowLeft className="w-4 h-4 mr-2 text-emerald-600" />
            {tButtons('back')}
          </Link>
        </Button>

        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 sm:p-10">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">{t('createTournamentTitle')}</CardTitle>
            <CardDescription className="text-base font-medium text-slate-400 mt-2">
              {t('createTournamentHint')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 sm:p-10">
            <TournamentForm names={names} locations={locations} />
          </CardContent>
        </Card>
      </main>
    </>
  )
}
