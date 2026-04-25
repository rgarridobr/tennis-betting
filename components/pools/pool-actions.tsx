"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { joinPoolAction, leavePoolAction } from "@/lib/actions/pools";
import { Lock, LogOut, Users, Share2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface PoolActionsProps {
  poolId: number;
  poolName: string;
  isMember: boolean;
  needsPassword?: boolean;
}

export function PoolActions({ poolId, poolName, isMember, needsPassword }: PoolActionsProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (needsPassword && !showPasswordDialog) {
      setShowPasswordDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await joinPoolAction(poolId, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setShowPasswordDialog(false);
      toast.success(`Você entrou no bolão ${poolName}.`);
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Tem certeza que deseja sair deste bolão?")) return;

    setIsLoading(true);
    const result = await leavePoolAction(poolId);

    if (result.success) {
      toast.success(`Você não faz mais parte do bolão ${poolName}.`);
    }
    setIsLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("O link deste bolão foi copiado para sua área de transferência.");
  };

  if (isMember) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="rounded-xl font-bold border-slate-200"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
        <Button
          variant="ghost"
          className="rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLeave}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-8 h-12"
        onClick={handleJoin}
        disabled={isLoading}
      >
        <Users className="w-5 h-5 mr-2" />
        {needsPassword ? "Entrar com Senha" : "Entrar no Bolão"}
      </Button>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Senha de Acesso</DialogTitle>
            <DialogDescription>
              Este bolão é privado. Digite a senha para entrar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPasswordDialog(false)}
              className="rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleJoin}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Validando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
