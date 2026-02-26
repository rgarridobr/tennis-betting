'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Target, TrendingUp, Crown, Award, CheckCircle2 } from 'lucide-react'
import type { RankingEntry } from '@/lib/data'

interface TournamentRankingProps {
  ranking: RankingEntry[]
  currentUserId: number
}

export function TournamentRanking({ ranking, currentUserId }: TournamentRankingProps) {
  if (ranking.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white rounded-[2.5rem]">
        <CardContent className="py-16 text-center">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nenhum palpite ainda</h2>
          <p className="text-slate-500">As classificações aparecerão assim que os resultados forem lançados.</p>
        </CardContent>
      </Card>
    )
  }

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <div className="space-y-8">
      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {top3[1] && <PodiumCard entry={top3[1]} position={2} isCurrentUser={top3[1].user_id === currentUserId} />}
          <PodiumCard entry={top3[0]} position={1} isCurrentUser={top3[0].user_id === currentUserId} />
          {top3[2] && <PodiumCard entry={top3[2]} position={3} isCurrentUser={top3[2].user_id === currentUserId} />}
        </div>
      )}

      {/* Full List */}
      <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            Classificação Completa
          </h3>
          <Badge variant="outline" className="font-bold">{ranking.length} participantes</Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {ranking.map((entry) => (
              <RankingRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === currentUserId}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PodiumCard({ entry, position, isCurrentUser }: { entry: RankingEntry, position: number, isCurrentUser: boolean }) {
  const config = {
    1: { bg: 'bg-amber-400', icon: Crown, label: '1º Lugar', ring: 'ring-amber-200' },
    2: { bg: 'bg-slate-400', icon: Medal, label: '2º Lugar', ring: 'ring-slate-200' },
    3: { bg: 'bg-orange-400', icon: Award, label: '3º Lugar', ring: 'ring-orange-200' },
  }[position as 1|2|3]

  const accuracy = entry.total_predictions > 0
    ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
    : 0

  return (
    <Card className={`border-0 shadow-xl overflow-hidden rounded-[2.5rem] relative ${isCurrentUser ? 'ring-4 ring-emerald-500 ring-offset-4' : ''} ${position === 1 ? 'md:-translate-y-4' : 'md:mt-4'}`}>
      <div className={`h-2 ${config.bg}`} />
      <CardContent className="p-8 text-center">
        <div className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <config.icon className="w-8 h-8 text-white" />
        </div>
        <Badge className={`${config.bg} text-white border-none font-black uppercase tracking-widest text-[10px] px-3 py-1 mb-4`}>
          {config.label}
        </Badge>
        <h4 className="text-xl font-black text-slate-900 truncate mb-1">
          {entry.user_nickname || entry.user_name}
        </h4>
        <div className="text-3xl font-black text-slate-900 mb-4 flex items-center justify-center gap-1">
          {entry.total_points}
          <span className="text-xs text-slate-400 uppercase tracking-widest">pts</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl py-3 px-4">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            {entry.correct_predictions} acertos
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            {accuracy}%
          </div>
        </div>
        {entry.final_score_correct && (
           <Badge className="mt-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold gap-1">
             <CheckCircle2 className="w-3 h-3" /> Placar Final
           </Badge>
        )}
      </CardContent>
    </Card>
  )
}

function RankingRow({ entry, isCurrentUser }: { entry: RankingEntry, isCurrentUser: boolean }) {
  const accuracy = entry.total_predictions > 0
    ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
    : 0

  return (
    <div className={`flex items-center justify-between px-8 py-6 transition-colors ${isCurrentUser ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'}`}>
      <div className="flex items-center gap-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
          entry.rank === 1 ? 'bg-amber-400 text-white' :
          entry.rank === 2 ? 'bg-slate-400 text-white' :
          entry.rank === 3 ? 'bg-orange-400 text-white' :
          'bg-slate-100 text-slate-500'
        }`}>
          {entry.rank}
        </div>
        <div>
          <p className="font-black text-slate-900 flex items-center gap-2 leading-none mb-1.5">
            {entry.user_nickname || entry.user_name}
            {isCurrentUser && <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] h-4">VOCÊ</Badge>}
            {entry.final_score_correct && (
              <div title="Acertou o placar da final">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </p>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {entry.correct_predictions} ACERTOS
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {accuracy}% PRECISÃO
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-black text-slate-900 leading-none">
          {entry.total_points}
        </p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pontos</p>
      </div>
    </div>
  )
}
