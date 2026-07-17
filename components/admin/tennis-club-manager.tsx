'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Building2, Loader2, Plus, Edit3, Trash2, X, AlertTriangle } from 'lucide-react';
import { createTennisClubAction, updateTennisClubAction, deleteTennisClubAction } from '@/lib/actions/admin';
import type { TennisClub } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

export function TennisClubManager({ clubs }: { clubs: TennisClub[] }) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const tCommon = useTranslations('common');
  const tShared = useTranslations('shared');
  const [name, setName] = useState('');
  const [editingClubId, setEditingClubId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteClubId, setDeleteClubId] = useState<number | null>(null);
  const [deleteClubName, setDeleteClubName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTennisClubAction(formData);
      if (result.success) {
        toast.success(t('tennisClub.toastCreated'));
        setName('');
      } else {
        toast.error(result.error || tCommon('error'));
      }
    });
  }

  function handleEdit(club: TennisClub) {
    setEditingClubId(club.id);
    setEditingName(club.name);
  }

  function handleCancelEdit() {
    setEditingClubId(null);
    setEditingName('');
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const result = await updateTennisClubAction(formData);
      if (result.success) {
        toast.success(t('tennisClub.toastUpdated'));
        handleCancelEdit();
      } else {
        toast.error(result.error || tCommon('error'));
      }
    });
  }

  function confirmDelete(club: TennisClub) {
    setDeleteClubId(club.id);
    setDeleteClubName(club.name);
    setShowDeleteConfirm(true);
  }

  function handleDelete() {
    if (deleteClubId === null) return;

    setShowDeleteConfirm(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('id', String(deleteClubId));
      const result = await deleteTennisClubAction(formData);
      if (result.success) {
        toast.success(t('tennisClub.toastDeleted'));
      } else {
        toast.error(result.error || tCommon('error'));
      }
    });
  }

  return (
    <>
      <Card className="mb-8 rounded-[2rem] border-0 bg-white shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">{t('clubsTitle')}</h3>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {t('clubsSubtitle')}
              </p>
            </div>

            <form action={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
              <Input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={tShared('clubCustomPlaceholder')}
                className="h-12 rounded-2xl border-slate-200"
                required
              />
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 rounded-2xl bg-emerald-600 px-5 font-black hover:bg-emerald-700"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {tButtons('save')}
              </Button>
            </form>
          </div>

          <div className="mt-8 space-y-3">
            {clubs.map((club) => (
              <div key={club.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                {editingClubId === club.id ? (
                  <form
                    action={handleUpdate}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1"
                  >
                    <input type="hidden" name="id" value={club.id} />
                    <Input
                      name="name"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="h-12 rounded-2xl border-slate-200"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isPending} className="h-12 rounded-2xl bg-emerald-600 px-4 font-black hover:bg-emerald-700">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                        {tButtons('save')}
                      </Button>
                      <Button type="button" variant="secondary" onClick={handleCancelEdit} className="h-12 rounded-2xl px-4 font-black">
                        <X className="h-4 w-4" />
                        {tButtons('cancel')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-800">{club.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEdit(club)}
                        className="h-10 rounded-2xl px-4 font-black"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        {tButtons('edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => confirmDelete(club)}
                        className="h-10 rounded-2xl px-4 font-black"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tButtons('delete')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">{t('tennisClub.deleteTitle')}</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t.rich('tennisClub.deleteDescription', {
                name: deleteClubName,
                bold: (chunks) => <span className="font-bold text-slate-900">{chunks}</span>,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1 rounded-xl font-black h-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-100"
            >
              {tButtons('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
