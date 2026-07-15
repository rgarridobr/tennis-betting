'use client';

import React from 'react';

import { useState, useTransition } from 'react';
import { createPlayerAction, importPlayersAction, deletePlayerAction, updatePlayerAction } from '@/lib/actions/admin';
import type { Player } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserPlus,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslations } from 'next-intl';

interface Props {
  players: Player[];
}

export function PlayerManager({ players }: Props) {
  const t = useTranslations('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="border-0 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">{t('players.title')}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('players.countInSystem', { n: players.length })}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isOpen ? t('players.collapseSearch') : t('players.expandSearch')}
                  </span>
                  <span className="sm:hidden">
                    {isOpen ? t('players.collapse') : t('players.expand')}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <AddPlayersDialog />
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
          <CardContent>
            {/* Search */}
            <div className="relative mb-4 mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t('players.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9"
              />
            </div>

            {/* Player list */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  {players.length === 0 ? t('players.empty') : t('players.notFound')}
                </p>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {p.name}
                      </span>
                      {p.display_name && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-slate-50 text-slate-500 border-slate-200">
                          {p.display_name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.country && <span className="text-xs text-slate-500 mr-2">{p.country}</span>}
                      <EditPlayerDialog player={p} />
                      <DeletePlayerDialog player={p} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function AddPlayersDialog() {
  const t = useTranslations('admin');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
          <UserPlus className="w-4 h-4" /> {t('players.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('players.addTitle')}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="individual" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="individual" className="flex-1 gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> {t('players.individual')}
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 gap-1.5">
              <Upload className="w-3.5 h-3.5" /> {t('players.bulkImport')}
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
  );
}

function AddSinglePlayer({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createPlayerAction(formData);
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || t('players.errorRegister'));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t('players.registered')}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{t('players.nameRequired')}</Label>
        <Input id="name" name="name" placeholder={t('players.namePlaceholder')} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">{t('players.displayName')}</Label>
        <Input id="display_name" name="display_name" placeholder="" />
        <p className="text-[10px] text-slate-500">{t('players.displayNameHint')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">{t('players.countryCode')}</Label>
        <Input id="country" name="country" placeholder={t('players.countryPlaceholder')} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? tButtons('saving') : t('players.registerPlayer')}
      </Button>
    </form>
  );
}

function EditPlayerDialog({ player }: { player: Player }) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePlayerAction(player.id, formData);
      if (result.success) {
        toast.success(t('players.toastUpdated'));
        setOpen(false);
      } else {
        setError(result.error || t('players.errorUpdate'));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('players.editTitle')}</DialogTitle>
          <DialogDescription>{t('players.editDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">{t('players.nameRequired')}</Label>
            <Input id="edit-name" name="name" defaultValue={player.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-display-name">{t('players.displayName')}</Label>
            <Input id="edit-display-name" name="display_name" defaultValue={player.display_name || ''} placeholder="" />
            <p className="text-[10px] text-slate-500">{t('players.displayNameHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-country">{t('players.countryCode')}</Label>
            <Input id="edit-country" name="country" defaultValue={player.country || ''} placeholder={t('players.countryPlaceholder')} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {tButtons('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? tButtons('saving') : t('players.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePlayerDialog({ player }: { player: Player }) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlayerAction(player.id);
      if (result.success) {
        toast.success(t('players.toastDeleted'));
        setOpen(false);
      } else {
        toast.error(result.error || t('players.toastDeleteError'));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('players.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t.rich('players.deleteDesc', {
              name: player.name,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            {tButtons('cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? t('players.deleting') : t('players.deletePlayer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportPlayersForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('admin');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const text = formData.get('players') as string;

    if (!text.trim()) {
      setError(t('players.pasteList'));
      return;
    }

    startTransition(async () => {
      const res = await importPlayersAction(text);
      if (res.success) {
        setResult(t('players.importSuccess', { count: res.count }));
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error || t('players.importError'));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {result && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {result}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('players.playerList')}</Label>
        <Textarea
          name="players"
          rows={10}
          placeholder={t('players.importPlaceholder')}
          className="font-mono text-xs max-h-50"
          required
        />
        <p className="text-xs text-slate-400">
          {t('players.importHint')}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t('players.importing') : t('players.importPlayers')}
      </Button>
    </form>
  );
}
