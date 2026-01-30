import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Trophy } from 'lucide-react'
import type { Tournament } from '@/lib/data'

interface TournamentHeaderProps {
  tournament: Tournament
  participants?: number
  prizePool?: number
}

const surfaceColors: Record<string, string> = {
  clay: 'bg-orange-500 text-white',
  grass: 'bg-emerald-600 text-white',
  hard: 'bg-blue-500 text-white',
}

const surfaceLabels: Record<string, string> = {
  clay: 'Saibro',
  grass: 'Grama',
  hard: 'Quadra dura',
}

const surfaceImages: Record<string, string> = {
  clay: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1920&q=80',
  grass: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1920&q=80',
  hard: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1920&q=80',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function TournamentHeader({ tournament, participants = 0, prizePool = 0 }: TournamentHeaderProps) {
  const statusLabel = tournament.status === 'live' 
    ? 'Ao vivo' 
    : tournament.status === 'finished' 
      ? 'Finalizado' 
      : 'Em breve'
  
  const statusColor = tournament.status === 'live' 
    ? 'bg-emerald-500 text-white' 
    : tournament.status === 'finished'
      ? 'bg-slate-500 text-white'
      : 'bg-amber-400 text-amber-900'

  const bgImage = tournament.image_url || surfaceImages[tournament.surface] || surfaceImages.hard

  return (
    <div className="relative py-10 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/85 to-slate-900/80" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className={surfaceColors[tournament.surface] || 'bg-muted text-muted-foreground'}>
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
                <span>
                  {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{tournament.location}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <Users className="w-5 h-5 text-white/80 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{participants}</p>
              <p className="text-xs text-white/70">Participantes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{formatCurrency(prizePool)}</p>
              <p className="text-xs text-white/70">Prêmio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
