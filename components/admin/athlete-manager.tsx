'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Plus, Trash2, Upload, Search } from 'lucide-react'
import { createAthlete, deleteAthlete, bulkAddAthletes } from '@/lib/actions/bracket'

interface Athlete {
  id: number
  name: string
  country: string | null
  seed: number | null
}

interface AthleteManagerProps {
  athletes: Athlete[]
}

export function AthleteManager({ athletes }: AthleteManagerProps) {
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.country?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddAthlete(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    const result = await createAthlete(formData)
    setIsLoading(false)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Atleta adicionado com sucesso!' })
      // Clear form
      const form = document.getElementById('add-athlete-form') as HTMLFormElement
      form?.reset()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao adicionar atleta' })
    }
  }

  async function handleBulkAdd(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    const result = await bulkAddAthletes(formData)
    setIsLoading(false)
    
    if (result.success) {
      setMessage({ type: 'success', text: `${result.added} atletas adicionados!` })
      const form = document.getElementById('bulk-add-form') as HTMLFormElement
      form?.reset()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao adicionar atletas' })
    }
  }

  async function handleDelete(athleteId: number) {
    if (!confirm('Tem certeza que deseja excluir este atleta?')) return
    
    const result = await deleteAthlete(athleteId)
    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Erro ao excluir atleta' })
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Gerenciar Atletas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
            <TabsTrigger value="bulk">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar atleta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredAthletes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  {athletes.length === 0 ? 'Nenhum atleta cadastrado' : 'Nenhum resultado encontrado'}
                </p>
              ) : (
                filteredAthletes.map((athlete) => (
                  <div 
                    key={athlete.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {athlete.seed && (
                        <Badge variant="outline" className="text-xs">
                          {athlete.seed}
                        </Badge>
                      )}
                      <div>
                        <p className="font-medium text-sm text-slate-900">{athlete.name}</p>
                        {athlete.country && (
                          <p className="text-xs text-slate-500">{athlete.country}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(athlete.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-slate-500 text-center">
              {athletes.length} atleta(s) cadastrado(s)
            </p>
          </TabsContent>

          <TabsContent value="add">
            <form id="add-athlete-form" action={handleAddAthlete} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Atleta</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Carlos Alcaraz"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País (sigla)</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Ex: ESP"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed (opcional)</Label>
                  <Input
                    id="seed"
                    name="seed"
                    type="number"
                    min="1"
                    max="32"
                    placeholder="Ex: 1"
                  />
                </div>
              </div>

              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Adicionando...' : 'Adicionar Atleta'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <form id="bulk-add-form" action={handleBulkAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="athletes">Lista de Atletas</Label>
                <textarea
                  id="athletes"
                  name="athletes"
                  className="w-full min-h-[200px] p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Digite um atleta por linha:
Carlos Alcaraz (ESP) [1]
Jannik Sinner (ITA) [2]
Novak Djokovic (SRB) [3]
...

Formato: Nome (País) [Seed]
País e Seed são opcionais`}
                  required
                />
              </div>

              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Importando...' : 'Importar Atletas'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
