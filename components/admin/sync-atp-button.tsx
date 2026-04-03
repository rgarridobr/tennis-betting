'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { syncAtpCalendarAction, getLastSyncTime } from '@/lib/actions/atp-sync';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SyncAtpButton() {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [canSync, setCanSync] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const checkSyncStatus = async () => {
    const lastSyncStr = await getLastSyncTime();
    if (lastSyncStr) {
      const lastSyncDate = new Date(lastSyncStr);
      setLastSync(lastSyncDate);
      const now = new Date();
      const diff = now.getTime() - lastSyncDate.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (diff < oneDay) {
        setCanSync(false);
        const remaining = oneDay - diff;
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        setTimeRemaining(`${hours}h ${minutes}min`);
      } else {
        setCanSync(true);
      }
    } else {
      setCanSync(true);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await syncAtpCalendarAction();
      if (result.success) {
        toast.success(`Sincronização concluída! Criados: ${result.createdCount}, Atualizados: ${result.updatedCount}`);
        checkSyncStatus();
      } else {
        toast.error(result.error || 'Erro ao sincronizar');
      }
    } catch (error) {
      toast.error('Erro ao sincronizar com ATP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-2 w-full sm:w-auto group">
      <Button
        onClick={handleSync}
        disabled={loading || !canSync}
        variant="outline"
        size="lg"
        className=" w-full sm:w-auto border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-black rounded-2xl h-12 sm:h-14 px-4 sm:px-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
        Sincronizar ATP
      </Button>

      {/* MOBILE */}
      {!canSync && !loading && (
        <div className="sm:hidden text-xs text-muted-foreground text-center">
          <p className="font-semibold">Disponível em {timeRemaining}</p>
          {lastSync && (
            <p className="text-[10px]">
              Última sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })}
            </p>
          )}
        </div>
      )}

      {/* DESKTOP TOOLTIP */}
      {!canSync && !loading && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden sm:block z-50 opacity-0 group-hover:opacity-100 transition">
          <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl whitespace-nowrap">
            <p className="font-bold">Disponível em {timeRemaining}</p>
            {lastSync && (
              <p className="text-[10px] text-slate-400 mt-1">
                Última sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: ptBR })}
              </p>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
}
