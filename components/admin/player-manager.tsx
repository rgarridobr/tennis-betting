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
    <Card className="border-0 shadow-lg overflow-hidden rounded-3xl">
      <CardHeader className="bg-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Jogadores Cadastrados</CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">{players.length} jogadores no sistema</p>
            </div>
          </div>
          <AddPlayersDialog />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar jogador por nome ou país..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Player list */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {players.length === 0 ? 'Nenhum jogador cadastrado. Adicione jogadores para começar.' : 'Nenhum jogador encontrado para sua busca.'}
              </p>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-base font-bold text-slate-800 block">{p.name}</span>
                    {p.country && (
                      <span className="text-xs text-slate-500 font-medium">{p.country}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
        <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 border-0">
          <UserPlus className="w-5 h-5" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Adicionar Jogadores</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Cadastre novos atletas no sistema</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="individual" className="mt-0">
            <TabsList className="w-full bg-slate-100 p-1 rounded-2xl h-12 mb-6">
              <TabsTrigger value="individual" className="flex-1 gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <UserPlus className="w-4 h-4" /> Individual
              </TabsTrigger>
              <TabsTrigger value="import" className="flex-1 gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="w-4 h-4" /> Importar em Lote
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-0">
              <AddSinglePlayer onSuccess={() => setOpen(false)} />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <ImportPlayersForm onSuccess={() => setOpen(false)} />
            </TabsContent>
          </Tabs>
        </div>
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />Jogador cadastrado com sucesso!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-700 font-semibold ml-1">Nome Completo *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Ex: Carlos Alcaraz"
          required
          className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-slate-700 font-semibold ml-1">País / Sigla</Label>
        <Input
          id="country"
          name="country"
          placeholder="Ex: ESP"
          className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-500"
        />
      </div>

      <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all" disabled={isPending}>
        {isPending ? 'Cadastrando...' : 'Finalizar Cadastro'}
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
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Pencil className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Editar Jogador</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Atualize os dados de {player.name}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-slate-700 font-semibold ml-1">Nome Completo *</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={player.name}
              required
              className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-country" className="text-slate-700 font-semibold ml-1">País / Sigla</Label>
            <Input
              id="edit-country"
              name="country"
              defaultValue={player.country || ''}
              placeholder="Ex: ESP"
              className="h-12 bg-slate-50 border-slate-200 rounded-2xl focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
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
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Excluir Jogador</DialogTitle>
              <p className="text-sm text-slate-400 mt-0.5">Confirme a exclusão do atleta</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6">
            <p className="text-sm text-rose-800 leading-relaxed">
              Tem certeza que deseja excluir <strong>{player.name}</strong>?
              <br /><br />
              Esta ação é irreversível e o jogador será removido permanentemente do sistema. Se ele estiver vinculado a partidas, a exclusão será bloqueada.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </Button>
          </div>
        </div>
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
        </div>
      )}
      {result && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />{result}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-slate-700 font-semibold ml-1 text-sm mb-1 block">Lista de Jogadores</Label>
        <Textarea
          name="players"
          rows={8}
          placeholder={`Exemplo:\nCarlos Alcaraz (ESP)\nJannik Sinner (ITA)\nNovak Djokovic (SRB)`}
          className="font-mono text-xs max-h-60 bg-slate-50 border-slate-200 rounded-2xl focus:ring-emerald-500 p-4"
          required
        />
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
          <p className="text-[11px] text-blue-700 leading-tight">
            <strong>Dica:</strong> Formatos aceitos: "Nome (País)" ou apenas "Nome". Um jogador por linha. O sistema ignora numeração automaticamente (ex: "1. Alcaraz").
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all" disabled={isPending}>
        {isPending ? 'Importando atletas...' : 'Iniciar Importação'}
      </Button>
    </form>
  )
}
