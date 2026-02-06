'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Trash2, Dices, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registerPlayerAction, removePlayerEntryAction, generateDrawAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import { Player, Tournament } from '@/lib/data'
import { TournamentEntry } from '@/lib/admin'

interface Props {
  tournament: Tournament
  allPlayers: Player[]
  currentEntries: TournamentEntry[]
}

export function TournamentRegistration({ tournament, allPlayers, currentEntries }: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('ENTRY_DIRECT')
  const [ranking, setRanking] = useState<string>('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegister = async () => {
    if (!selectedPlayerId) return
    setIsRegistering(true)
    try {
      await registerPlayerAction({
        tournamentId: tournament.id,
        playerId: parseInt(selectedPlayerId),
        entryType,
        rankingAtCutoff: ranking ? parseInt(ranking) : undefined
      })
      toast.success('Jogador registrado com sucesso')
      setSelectedPlayerId('')
      setRanking('')
    } catch (error) {
      toast.error('Erro ao registrar jogador')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleRemove = async (playerId: number) => {
    try {
      await removePlayerEntryAction(tournament.id, playerId)
      toast.success('Jogador removido')
    } catch (error) {
      toast.error('Erro ao remover jogador')
    }
  }

  const handleGenerateDraw = async () => {
    const seed = Math.random().toString(36).substring(7)
    setIsGenerating(true)
    const result = await generateDrawAction(tournament.id, seed)
    if (result.success) {
      toast.success('Chaveamento gerado com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao gerar chaveamento')
    }
    setIsGenerating(false)
  }

  const availablePlayers = allPlayers.filter(p => !currentEntries.find(e => e.player_id === p.id))

  const counts = {
    DIRECT: currentEntries.filter(e => e.entry_type === 'ENTRY_DIRECT' || e.entry_type === 'ENTRY_SEED').length,
    QUALIFIER: currentEntries.filter(e => e.entry_type === 'ENTRY_QUALIFIER').length,
    WILDCARD: currentEntries.filter(e => e.entry_type === 'ENTRY_WILDCARD').length,
    SEED: currentEntries.filter(e => e.entry_type === 'ENTRY_SEED').length,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inscritos no Torneio</CardTitle>
          <CardDescription>
            Adicione os jogadores conforme o ranking de cut-off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs">Jogador</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecionar jogador" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Label className="text-xs">Tipo de Entrada</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY_DIRECT">Direto</SelectItem>
                  <SelectItem value="ENTRY_SEED">Cabeça de Chave</SelectItem>
                  <SelectItem value="ENTRY_WILDCARD">Wildcard</SelectItem>
                  <SelectItem value="ENTRY_QUALIFIER">Qualifier</SelectItem>
                  <SelectItem value="ENTRY_SPECIAL_EXEMPT">Special Exempt</SelectItem>
                  <SelectItem value="ENTRY_LUCKY_LOSER">Lucky Loser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[100px]">
              <Label className="text-xs">Ranking</Label>
              <Input
                type="number"
                value={ranking}
                onChange={e => setRanking(e.target.value)}
                className="bg-white"
                placeholder="Ex: 1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleRegister} disabled={isRegistering || !selectedPlayerId} className="gap-2">
                <UserPlus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 uppercase font-bold">Diretos/Seeds</p>
              <p className="text-2xl font-bold text-blue-900">{counts.DIRECT} / {tournament.direct_entries_count}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-[10px] text-purple-600 uppercase font-bold">Seeds Marcados</p>
              <p className="text-2xl font-bold text-purple-900">{counts.SEED} / {tournament.seeds_count}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-[10px] text-amber-600 uppercase font-bold">Qualifiers</p>
              <p className="text-2xl font-bold text-amber-900">{counts.QUALIFIER} / {tournament.qualifiers_count}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <p className="text-[10px] text-rose-600 uppercase font-bold">Wildcards</p>
              <p className="text-2xl font-bold text-rose-900">{counts.WILDCARD} / {tournament.wildcards_count}</p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">Pos</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Jogador</th>
                  <th className="text-left p-3 font-semibold text-slate-600">Entrada</th>
                  <th className="text-right p-3 font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500">{entry.ranking_at_cutoff || '-'}</td>
                    <td className="p-3 font-medium text-slate-900">{entry.player_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        entry.entry_type === 'ENTRY_SEED' ? 'bg-purple-100 text-purple-700' :
                        entry.entry_type === 'ENTRY_WILDCARD' ? 'bg-rose-100 text-rose-700' :
                        entry.entry_type === 'ENTRY_QUALIFIER' ? 'bg-amber-100 text-amber-700' :
                        entry.entry_type === 'ENTRY_SPECIAL_EXEMPT' ? 'bg-indigo-100 text-indigo-700' :
                        entry.entry_type === 'ENTRY_LUCKY_LOSER' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {entry.entry_type.replace('ENTRY_', '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(entry.player_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {currentEntries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Nenhum jogador inscrito</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="text-center">
              <h3 className="font-bold text-emerald-900">Gerar Chaveamento Oficial</h3>
              <p className="text-sm text-emerald-700 max-w-md mx-auto mt-1">
                Uma vez que todos os jogadores estejam inscritos, você pode gerar a chave definitiva seguindo as regras da ATP.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleGenerateDraw}
              disabled={isGenerating || currentEntries.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 h-12 shadow-lg shadow-emerald-200"
            >
              {isGenerating ? (
                <>Gerando...</>
              ) : (
                <>
                  <Dices className="w-5 h-5" />
                  Sortear e Publicar Chave
                </>
              )}
            </Button>

            <p className="text-[10px] text-emerald-600 font-medium">
              ESTE PROCESSO É DETERMINÍSTICO COM RANDOM SEED PARA AUDITORIA.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
