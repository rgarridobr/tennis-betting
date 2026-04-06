"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { syncTournamentBracketAction } from "@/lib/actions/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncTournamentBracketButtonProps {
  tournamentId: number;
  isReady: boolean;
}

export function SyncTournamentBracketButton({
  tournamentId,
  isReady,
}: SyncTournamentBracketButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setLoading(true);
    try {
      const result = await syncTournamentBracketAction(tournamentId);
      if (result.success) {
        toast.success(
          `Sincronizado com sucesso! ${result.updatedCount} partidas atualizadas.`,
        );
      } else {
        toast.error(result.error || "Erro ao sincronizar chaveamento");
      }
    } catch (error) {
      console.error("Error syncing bracket:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isReady && (
        <Button
          onClick={() => setShowSyncConfirm(true)}
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
      )}

      <Dialog open={showSyncConfirm} onOpenChange={setShowSyncConfirm}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">
              Sincronizar Chaveamento?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              Deseja sincronizar o chaveamento com a ATP? Isso substituirá os
              jogadores da Rodada 1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button
              variant="outline"
              onClick={() => setShowSyncConfirm(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSync}
              variant="default"
              className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
            >
              Sim, Sincronizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
