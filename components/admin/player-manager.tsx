'use client'

import React from "react"

import { useState, useTransition } from 'react'
import { createPlayerAction, importPlayersAction, deletePlayerAction, updatePlayerAction } from '@/lib/actions/admin'
import type { Player } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { UserPlus, Upload, Search, CheckCircle2, AlertCircle, Users, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  players: Player[]
}

export function PlayerManager({ players }: Props) {
  const [search, setSearch] = useState('')
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.country && p.country.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Jogadores Cadastrados</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{players.length} jogadores no sistema</p>
            </div>
          </div>
          <AddPlayersDialog />
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar jogador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Player list */}
        <div className="max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {players.length === 0 ? 'Nenhum jogador cadastrado. Adicione jogadores para começar.' : 'Nenhum jogador encontrado.'}
            </p>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.country && (
                    <span className="text-xs text-slate-500 mr-2">{p.country}</span>
                  )}
                  <EditPlayerDialog player={p} />
                  <DeletePlayerDialog player={p} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AddPlayersDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Jogadores</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="individual" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="individual" className="flex-1 gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Individual
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Importar em Lote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <AddSinglePlayer onSuccess={() => setOpen(false)} />
          </TabsContent>

          <TabsContent value="import">
            <ImportPlayersForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function AddSinglePlayer({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createPlayerAction(formData)
      if (result.success) {
        setSuccess(true)
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setSuccess(false), 2000)
      } else {
        setError(result.error || 'Erro ao cadastrar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />Jogador cadastrado!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Jogador *</Label>
        <Input id="name" name="name" placeholder="Ex: Carlos Alcaraz" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Sigla do País</Label>
        <Input id="country" name="country" placeholder="Ex: ESP" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Cadastrar Jogador'}
      </Button>
    </form>
  )
}

function EditPlayerDialog({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updatePlayerAction(player.id, formData)
      if (result.success) {
        toast.success('Jogador atualizado com sucesso')
        setOpen(false)
      } else {
        setError(result.error || 'Erro ao atualizar')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
          <DialogDescription>
            Altere as informações do jogador conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Jogador *</Label>
            <Input id="edit-name" name="name" defaultValue={player.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-country">Sigla do País</Label>
            <Input id="edit-country" name="country" defaultValue={player.country || ''} placeholder="Ex: ESP" />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeletePlayerDialog({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlayerAction(player.id)
      if (result.success) {
        toast.success('Jogador excluido com sucesso')
        setOpen(false)
      } else {
        toast.error(result.error || 'Erro ao excluir jogador')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Jogador</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja excluir <strong>{player.name}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Excluindo...' : 'Excluir Jogador'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportPlayersForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const text = formData.get('players') as string

    if (!text.trim()) {
      setError('Cole a lista de jogadores')
      return
    }

    startTransition(async () => {
      const res = await importPlayersAction(text)
      if (res.success) {
        setResult(`${res.count} jogadores importados com sucesso!`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        setError(res.error || 'Erro ao importar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {result && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{result}
        </div>
      )}

      <div className="space-y-2">
        <Label>Lista de Jogadores</Label>
        <Textarea
          name="players"
          rows={10}
          placeholder={`Cole a lista no formato:\nCarlos Alcaraz (ESP)\nJannik Sinner (ITA)\nNovak Djokovic (SRB)\n...\n\nOu apenas nomes:\nCarlos Alcaraz\nJannik Sinner\nNovak Djokovic`}
          className="font-mono text-xs max-h-50"
          required
        />
        <p className="text-xs text-slate-400">
          Formatos aceitos: "Nome (Pais)" ou apenas "Nome". Um jogador por linha. O sistema ignora numeracao caso exista.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Importando...' : 'Importar Jogadores'}
      </Button>
    </form>
  )
}
