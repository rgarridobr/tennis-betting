'use client';

import { useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleTournamentVisibilityAction } from '@/lib/actions/admin';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

interface TournamentVisibilityToggleProps {
  tournamentId: number;
  isVisible: boolean;
}

export function TournamentVisibilityToggle({
  tournamentId,
  isVisible: initialIsVisible,
}: TournamentVisibilityToggleProps) {
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    setIsVisible(checked);
    startTransition(async () => {
      try {
        await toggleTournamentVisibilityAction(tournamentId, checked);
        toast.success(checked ? 'Torneio agora está visível' : 'Torneio agora está oculto');
      } catch (error) {
        setIsVisible(!checked);
        toast.error('Erro ao atualizar visibilidade');
      }
    });
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
      {isVisible ? (
        <Eye className="w-4 h-4 text-emerald-600" />
      ) : (
        <EyeOff className="w-4 h-4 text-slate-400" />
      )}
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  );
}
