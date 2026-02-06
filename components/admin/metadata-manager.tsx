'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Settings2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { createMetadataAction, updateMetadataAction, deleteMetadataAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import type { TournamentMetadata } from '@/lib/data'

interface Props {
  type: 'name' | 'location'
  title: string
  options: TournamentMetadata[]
}

export function MetadataManager({ type, title, options }: Props) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newValue, setNewValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    if (!newValue.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createMetadataAction(type, newValue)
      if (result.success) {
        setNewValue('')
        toast.success(`${title} adicionado!`)
      }
    })
  }

  function handleUpdate(id: number) {
    if (!newValue.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await updateMetadataAction(type, id, newValue)
      if (result.success) {
        setEditingId(null)
        setNewValue('')
        toast.success(`${title} atualizado!`)
      }
    })
  }

  function handleDelete(id: number) {
    setError(null)
    startTransition(async () => {
      const result = await deleteMetadataAction(type, id)
      if (result.success) {
        toast.success(`${title} excluído!`)
      } else {
        setError(result.error || 'Erro ao excluir')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" title={`Gerenciar ${title}s`}>
          <Settings2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar {title}s</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Add new */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>Novo {title}</Label>
              <Input
                value={editingId ? '' : newValue}
                onChange={e => !editingId && setNewValue(e.target.value)}
                placeholder={`Ex: ${type === 'name' ? 'Australian Open' : 'Melbourne'}`}
                disabled={!!editingId || isPending}
              />
            </div>
            <Button onClick={handleAdd} disabled={!!editingId || isPending || !newValue}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-2 block text-slate-500">Cadastrados ({options.length})</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {options.map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 group">
                  {editingId === opt.id ? (
                    <Input
                      className="h-8 bg-white"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium">{opt.name}</span>
                  )}

                  <div className="flex items-center gap-1">
                    {editingId === opt.id ? (
                      <>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-emerald-600" onClick={() => handleUpdate(opt.id)} disabled={isPending}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500" onClick={() => { setEditingId(null); setNewValue(''); }} disabled={isPending}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setEditingId(opt.id); setNewValue(opt.name); }}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(opt.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {options.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-4">Nenhum {title.toLowerCase()} cadastrado.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
