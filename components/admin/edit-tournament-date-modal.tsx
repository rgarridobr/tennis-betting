'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { updateStartDateTournamentAction } from '@/lib/actions/admin';

interface Props {
  tournamentId: number;
  currentDate: Date;
}

export function EditTournamentDateModal({ tournamentId, currentDate }: Props) {
  const [date, setDate] = useState<Date | undefined>(currentDate);
  const [loading, setLoading] = useState(false);
  async function handleSave() {
    if (!date) return;
    try {
      setLoading(true);
      const response = await updateStartDateTournamentAction(tournamentId, format(date, 'yyyy-MM-dd HH:mm:ss'));

      if (!response.success) {
        throw new Error('Failed to update tournament date');
      }
      toast.success('Data e hora do torneio atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao atualizar a data do torneio.');
    }
    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-2xl bg-white/5 backdrop-blur-md font-bold h-14"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Alterar data e hora
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">Alterar data e hora do torneio</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label
              htmlFor="start_date"
              className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest"
            >
              <Calendar className="w-4 h-4 text-emerald-500" /> Data e Hora Início
            </Label>
            <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
              required
              className="h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700"
            />
          </div>

          <Button onClick={handleSave} className="w-full rounded-xl font-bold" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
