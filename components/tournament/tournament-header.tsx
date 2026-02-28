import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import type { Tournament } from '@/lib/data'

interface TournamentHeaderProps {
  tournament: Tournament
  participants?: number
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
  Clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
  Grass: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
  Hard: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function TournamentHeader({ tournament, participants = 0 }: TournamentHeaderProps) {
  const isLockedByDate = new Date(tournament.start_date) <= new Date()
  const isFinished = (tournament.status === 'finished' || tournament.status === 'FINISHED' || tournament.status === 'completed')

  const statusLabel = isFinished
    ? 'Finalizado'
    : isLockedByDate
      ? 'Em Andamento'
      : (tournament.status === 'active' || tournament.status === 'OPEN')
        ? 'Apostas Abertas'
        : 'Em breve'

  const statusColor = isFinished
    ? 'bg-slate-500 text-white'
    : isLockedByDate
      ? 'bg-blue-500 text-white'
      : (tournament.status === 'active' || tournament.status === 'OPEN')
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-400 text-amber-900'

  const bgImage = surfaceImages[tournament.surface] || surfaceImages.Hard

  return (
    <div className="relative py-16 md:py-22 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/85 to-slate-900/80" />

      <div className="relative container mx-auto px-4 md:px-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className={surfaceColors[tournament.surface] || 'bg-slate-500 text-white'}>
                {surfaceLabels[tournament.surface] || tournament.surface}
              </Badge>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{tournament.location}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">{participants}</p>
              <p className="text-xs text-white/70">Participantes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">128</p>
              <p className="text-xs text-white/70">Jogadores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
