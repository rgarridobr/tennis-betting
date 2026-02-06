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
    ? 'bg-emerald-500 text-white'
    : tournament.status === 'completed'
      ? 'bg-slate-500 text-white'
      : 'bg-amber-400 text-amber-900'

  const imageUrl = surfaceImages[tournament.surface] || surfaceImages.Hard

  return (
    <Link href={`/torneio/${tournament.id}`}>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 pt-0">
        <div className="relative h-52">
          <img src={imageUrl || "/placeholder.svg"} alt={tournament.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <Badge className={`absolute top-3 right-3 ${statusColor} font-medium`}>{statusLabel}</Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-lg drop-shadow-md">{tournament.name}</h3>
            <Badge className={`mt-1 ${surfaceColors[tournament.surface] || 'bg-slate-500 text-white'}`}>
              {surfaceLabels[tournament.surface] || tournament.surface}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 bg-white">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="truncate max-w-[120px]">{tournament.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
