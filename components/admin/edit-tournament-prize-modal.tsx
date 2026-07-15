'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateTournamentPrizeAction } from '@/lib/actions/admin';
import { useTranslations } from 'next-intl';

interface Props {
  tournamentId: number;
  initialPrizeDescription: string | null;
}

export function EditTournamentPrizeModal({ tournamentId, initialPrizeDescription }: Props) {
  const t = useTranslations('admin');
  const tButtons = useTranslations('buttons');
  const [prizeDescription, setPrizeDescription] = useState(initialPrizeDescription || '');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);
      const response = await updateTournamentPrizeAction(tournamentId, prizeDescription);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update tournament prize');
      }

      toast.success(t('prize.toastSuccess'));
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('prize.toastError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white rounded-2xl bg-white/5 backdrop-blur-md font-bold h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base"
        >
          <Gift className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">
            {initialPrizeDescription ? t('prize.editPrize') : t('prize.addPrize')}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[520px] rounded-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-black text-lg sm:text-xl">{t('prize.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <Label
              htmlFor="prize_description"
              className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] sm:text-xs tracking-widest"
            >
              <Gift className="w-4 h-4 text-emerald-500" /> {t('prize.description')}
            </Label>
            <Textarea
              id="prize_description"
              value={prizeDescription}
              onChange={(event) => setPrizeDescription(event.target.value)}
              placeholder={t('prize.placeholder')}
              className="min-h-36 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 text-sm sm:text-base px-3 sm:px-4"
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 rounded-xl font-bold" disabled={loading}>
            {loading ? tButtons('saving') : t('prize.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
