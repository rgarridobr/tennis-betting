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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
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

  const handleLeave = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeave = async () => {
    setIsLoading(true);
    const result = await leavePoolAction(poolId);
    
    if (result.success) {
      toast.success(`Você não faz mais parte do bolão ${poolName}.`);
      setShowLeaveDialog(false);
    } else {
      toast.error("Ocorreu um erro ao sair do bolão.");
    }
    setIsLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("O link deste bolão foi copiado para sua área de transferência.");
  };

  return (
    <>
      {isMember ? (
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
      ) : (
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-8 h-12"
          onClick={handleJoin}
          disabled={isLoading}
        >
          <Users className="w-5 h-5 mr-2" />
          {needsPassword ? "Entrar com Senha" : "Entrar no Bolão"}
        </Button>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">Senha de Acesso</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              Este bolão é privado. Digite a senha para entrar e participar do ranking.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-2 space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-none bg-rose-50 text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold">{error}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-center text-lg font-bold"
              autoFocus
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleJoin} 
              className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              disabled={isLoading}
            >
              {isLoading ? "Validando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <LogOut className="w-8 h-8 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">Sair do Bolão?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              Tem certeza que deseja sair de <strong>{poolName}</strong>? Seu progresso no ranking deste grupo será perdido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLeaveDialog(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              Voltar
            </Button>
            <Button 
              onClick={confirmLeave} 
              className="flex-1 rounded-xl font-black h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-rose-100"
              disabled={isLoading}
            >
              {isLoading ? "Saindo..." : "Sair do Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
