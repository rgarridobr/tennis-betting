'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronRight, Trophy, Edit2 } from 'lucide-react'
import { BracketMatchEditor } from './bracket-match-editor'

interface Athlete {
  id: number
  name: string
  country: string | null
  seed: number | null
}

interface BracketEntry {
  id: number
  tournament_id: number
  round: number
  position: number
  player1_id: number | null
  player2_id: number | null
  winner_id: number | null
  score: string | null
  player1_name: string | null
  player1_country: string | null
  player1_seed: number | null
  player2_name: string | null
  player2_country: string | null
  player2_seed: number | null
  winner_name: string | null
}

interface BracketViewProps {
  tournamentId: number
  entries: BracketEntry[]
  athletes: Athlete[]
  roundNames: Record<number, string>
}

export function BracketView({ tournamentId, entries, athletes, roundNames }: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<BracketEntry | null>(null)
  const [activeRound, setActiveRound] = useState('1')

  // Group entries by round
  const entriesByRound = entries.reduce((acc, entry) => {
    if (!acc[entry.round]) acc[entry.round] = []
    acc[entry.round].push(entry)
    return acc
  }, {} as Record<number, BracketEntry[]>)

  // Sort entries by position within each round
  Object.keys(entriesByRound).forEach(round => {
    entriesByRound[Number(round)].sort((a, b) => a.position - b.position)
  })

  const rounds = Object.keys(entriesByRound).map(Number).sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      {/* Round Tabs */}
      <Tabs value={activeRound} onValueChange={setActiveRound}>
        <TabsList className="flex-wrap h-auto gap-1 bg-white p-1 shadow-sm rounded-lg">
          {rounds.map((round) => (
            <TabsTrigger 
              key={round} 
              value={String(round)}
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              {roundNames[round] || `Rodada ${round}`}
              <Badge variant="outline" className="ml-2 text-xs">
                {entriesByRound[round]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {rounds.map((round) => (
          <TabsContent key={round} value={String(round)} className="mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    {roundNames[round] || `Rodada ${round}`}
                  </span>
                  <span className="text-sm font-normal text-slate-500">
                    {entriesByRound[round]?.filter(e => e.winner_id).length} / {entriesByRound[round]?.length} definidas
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {entriesByRound[round]?.map((entry) => (
                    <BracketMatchCard
                      key={entry.id}
                      entry={entry}
                      onEdit={() => setSelectedMatch(entry)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Match Editor Modal */}
      {selectedMatch && (
        <BracketMatchEditor
          entry={selectedMatch}
          athletes={athletes}
          tournamentId={tournamentId}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

function BracketMatchCard({ 
  entry, 
  onEdit 
}: { 
  entry: BracketEntry
  onEdit: () => void
}) {
  const hasPlayers = entry.player1_id && entry.player2_id
  const hasWinner = entry.winner_id

  return (
    <div 
      className={`relative rounded-lg border-2 overflow-hidden transition-all cursor-pointer hover:shadow-md ${
        hasWinner 
          ? 'border-emerald-200 bg-emerald-50/50' 
          : hasPlayers 
            ? 'border-amber-200 bg-amber-50/50' 
            : 'border-slate-200 bg-white'
      }`}
      onClick={onEdit}
    >
      {/* Match number */}
      <div className="absolute top-2 left-2">
        <span className="text-xs text-slate-400">#{entry.position}</span>
      </div>

      {/* Edit button */}
      <div className="absolute top-2 right-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-slate-400 hover:text-emerald-600"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="pt-6 pb-3 px-3">
        {/* Player 1 */}
        <PlayerRow 
          name={entry.player1_name}
          country={entry.player1_country}
          seed={entry.player1_seed}
          isWinner={entry.winner_id === entry.player1_id}
          score={entry.winner_id === entry.player1_id ? entry.score : null}
        />

        {/* VS Divider */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">vs</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Player 2 */}
        <PlayerRow 
          name={entry.player2_name}
          country={entry.player2_country}
          seed={entry.player2_seed}
          isWinner={entry.winner_id === entry.player2_id}
          score={entry.winner_id === entry.player2_id ? entry.score : null}
        />
      </div>

      {/* Status badge */}
      <div className="px-3 pb-2">
        {hasWinner ? (
          <Badge className="w-full justify-center bg-emerald-600 text-xs">
            Finalizado
          </Badge>
        ) : hasPlayers ? (
          <Badge variant="outline" className="w-full justify-center text-amber-600 border-amber-300 text-xs">
            Aguardando resultado
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full justify-center text-slate-400 text-xs">
            Definir jogadores
          </Badge>
        )}
      </div>
    </div>
  )
}

function PlayerRow({
  name,
  country,
  seed,
  isWinner,
  score,
}: {
  name: string | null
  country: string | null
  seed: number | null
  isWinner: boolean
  score: string | null
}) {
  if (!name) {
    return (
      <div className="flex items-center justify-between py-2 px-2 rounded bg-slate-100">
        <span className="text-sm text-slate-400 italic">A definir</span>
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center justify-between py-2 px-2 rounded transition-colors ${
        isWinner ? 'bg-emerald-100' : 'bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {seed && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {seed}
          </span>
        )}
        <div className="min-w-0">
          <p className={`text-sm truncate ${isWinner ? 'font-semibold text-emerald-800' : 'text-slate-700'}`}>
            {name}
          </p>
          {country && (
            <p className="text-xs text-slate-500">{country}</p>
          )}
        </div>
      </div>
      {isWinner && (
        <div className="flex items-center gap-1">
          {score && (
            <span className="text-xs text-emerald-600 font-medium">{score}</span>
          )}
          <ChevronRight className="w-4 h-4 text-emerald-600" />
        </div>
      )}
    </div>
  )
}
