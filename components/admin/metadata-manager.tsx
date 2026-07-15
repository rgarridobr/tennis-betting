'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Settings2, AlertCircle, Trophy, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createMetadataAction, updateMetadataAction, deleteMetadataAction } from '@/lib/actions/admin'
import { toast } from 'sonner'
import type { TournamentMetadata } from '@/lib/data'
import { useTranslations } from 'next-intl'

interface Props {
  type: 'name' | 'location'
  title: string
  options: TournamentMetadata[]
}

export function MetadataManager({ type, title, options }: Props) {
  const t = useTranslations('admin')
  const tButtons = useTranslations('buttons')
  const tUi = useTranslations('ui')
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
        toast.success(t('metadata.toastAdded', { title }))
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
        toast.success(t('metadata.toastUpdated', { title }))
      }
    })
  }

  function handleDelete(id: number) {
    setError(null)
    startTransition(async () => {
      const result = await deleteMetadataAction(type, id)
      if (result.success) {
        toast.success(t('metadata.toastDeleted', { title }))
      } else {
        setError(result.error || t('metadata.deleteError'))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-slate-50 border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
          title={t('metadata.manage', { title })}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              type === 'name' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {type === 'name' ? <Trophy className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{t('metadata.manage', { title })}</DialogTitle>
              <p className="text-slate-400 text-sm mt-0.5">
                {t('metadata.countRegistered', { count: options.length, title: title.toLowerCase() })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Add new */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-slate-600 ml-1">{t('metadata.addNew', { title })}</Label>
              <Input
                value={editingId ? '' : newValue}
                onChange={e => !editingId && setNewValue(e.target.value)}
                placeholder={tUi('examplePrefix', {
                  example: type === 'name' ? t('metadata.exampleName') : t('metadata.exampleLocation'),
                })}
                disabled={!!editingId || isPending}
                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-slate-900"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!!editingId || isPending || !newValue}
              className="h-11 w-11 rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-slate-500 font-medium">{t('metadata.list', { title })}</Label>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {options.map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                  {editingId === opt.id ? (
                    <Input
                      className="h-9 bg-slate-50 border-slate-200 focus:ring-slate-900 rounded-lg mr-2"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-700">{opt.name}</span>
                  )}

                  <div className="flex items-center gap-1">
                    {editingId === opt.id ? (
                      <>
                        <Button size="sm" variant="ghost" className="h-9 px-3 text-emerald-600 hover:bg-emerald-50 rounded-lg font-bold" onClick={() => handleUpdate(opt.id)} disabled={isPending}>
                          {tButtons('save')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 px-3 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => { setEditingId(null); setNewValue(''); }} disabled={isPending}>
                          {t('metadata.exit')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => { setEditingId(opt.id); setNewValue(opt.name); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleDelete(opt.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {options.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">
                    {t('metadata.empty', { title: title.toLowerCase() })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full md:w-auto rounded-xl h-11 px-8 text-slate-600"
            >
              {t('metadata.closeManager')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
