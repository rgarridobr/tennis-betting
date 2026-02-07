import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { Tournament } from '@/lib/data'

interface TournamentCardProps {
  tournament: Tournament
}

const surfaceColors: Record<string, string> = {
  Hard: 'bg-blue-500 text-white',
  Clay: 'bg-orange-500 text-white',
  Grass: 'bg-emerald-600 text-white',
}

const surfaceLabels: Record<string, string> = {
  Hard: 'Hard Court',
  Clay: 'Saibro',
  Grass: 'Grama',
}

const surfaceImages: Record<string, string> = {
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
  Grass: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80',
  Hard: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const statusLabel = tournament.status === 'active'
    ? 'Ativo'
    : tournament.status === 'completed'
      ? 'Finalizado'
      : 'Em breve'

  const statusColor = tournament.status === 'active'
    ? 'bg-emerald-500 text-white border-none'
    : tournament.status === 'completed'
      ? 'bg-slate-500 text-white border-none'
      : 'bg-amber-500 text-white border-none'

  const imageUrl = surfaceImages[tournament.surface] || surfaceImages.Hard

  return (
    <Link href={`/torneio/${tournament.id}`}>
      <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 pt-0 rounded-[2rem]">
        <div className="relative h-60">
          <img src={imageUrl || "/placeholder.svg"} alt={tournament.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <Badge className={`absolute top-4 right-4 ${statusColor} px-3 py-1 text-[10px] uppercase tracking-wider font-bold shadow-lg`}>
            {statusLabel}
          </Badge>
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="font-black text-white text-xl drop-shadow-lg leading-tight">{tournament.name}</h3>
            <Badge className={`mt-2 ${surfaceColors[tournament.surface] || 'bg-slate-500 text-white'} border-none font-bold px-3`}>
              {surfaceLabels[tournament.surface] || tournament.surface}
            </Badge>
          </div>
        </div>
        <CardContent className="px-6 py-5 bg-white">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="truncate max-w-[140px]">{tournament.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
