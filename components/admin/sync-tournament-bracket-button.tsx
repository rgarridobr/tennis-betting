'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { syncTournamentBracketAction } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface SyncTournamentBracketButtonProps {
  tournamentId: number;
}

export function SyncTournamentBracketButton({ tournamentId }: SyncTournamentBracketButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!confirm('Deseja sincronizar o chaveamento com a ATP? Isso substituirá os jogadores da Rodada 1.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await syncTournamentBracketAction(tournamentId);
      if (result.success) {
        toast.success(`Sincronizado com sucesso! ${result.updatedCount} partidas atualizadas.`);
      } else {
        toast.error(result.error || 'Erro ao sincronizar chaveamento');
      }
    } catch (error) {
      console.error('Error syncing bracket:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      className="bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 font-bold rounded-full px-6 transition-all"
    >
      {loading ? (
        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RefreshCcw className="w-4 h-4 mr-2" />
      )}
      Sincronizar Chaveamento ATP
    </Button>
  );
}
