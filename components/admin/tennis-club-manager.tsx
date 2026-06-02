'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Building2, Loader2, Plus } from 'lucide-react';
import { createTennisClubAction } from '@/lib/actions/admin';
import type { TennisClub } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function TennisClubManager({ clubs }: { clubs: TennisClub[] }) {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTennisClubAction(formData);
      if (result.success) {
        toast.success('Clube cadastrado com sucesso!');
        setName('');
      } else {
        toast.error(result.error || 'Erro ao cadastrar clube');
      }
    });
  }

  return (
    <Card className="mb-8 rounded-[2rem] border-0 bg-white shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900">Clubes oficiais</h3>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Cadastre aqui os clubes que aparecerão na seleção dos usuários.
            </p>
          </div>

          <form action={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
            <Input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome do clube"
              className="h-12 rounded-2xl border-slate-200"
              required
            />
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 rounded-2xl bg-emerald-600 px-5 font-black hover:bg-emerald-700"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Cadastrar
            </Button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {clubs.map((club) => (
            <span key={club.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {club.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
