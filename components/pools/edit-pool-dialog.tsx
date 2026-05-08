"use client";

import { useEffect, useState } from "react";
import { updatePoolAction, getPoolMembersWithPredictionsAction } from "@/lib/actions/pools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Pool, Tournament } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import { Switch } from "../ui/switch";

interface EditPoolDialogProps {
  pool: Pool;
  tournaments: Tournament[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPoolDialog({ pool, tournaments, open, onOpenChange }: EditPoolDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [hidePending, setHidePending] = useState(pool.hide_pending ?? true);

  useEffect(() => {
    if (open && pool.tournament_id) {
      const loadMembers = async () => {
        setIsLoadingMembers(true);
        const result = await getPoolMembersWithPredictionsAction(Number(pool.id), pool.tournament_id!);
        if (result.success) {
          setMembers(result.members);
        }
        setIsLoadingMembers(false);
      };
      loadMembers();
    }
  }, [open, pool.id, pool.tournament_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePoolAction(Number(pool.id), formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success) {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[95vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Editar Bolão</DialogTitle>
          <DialogDescription className="text-slate-500">
            Altere as informações do seu bolão ou mude o torneio atual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tournament_id" className="text-sm font-bold text-slate-700">Torneio Vinculado</Label>
            <Select name="tournament_id" defaultValue={pool.tournament_id ? String(pool.tournament_id) : undefined} required>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                <SelectValue placeholder="Selecione um torneio" />
              </SelectTrigger>
              <SelectContent>
                {tournaments
                  .filter((t) => 
                    ['active', 'OPEN', 'IN_PROGRESS', 'LOCKED', 'upcoming', 'published', 'UPCOMING'].includes(t.status) || t.id === pool.tournament_id
                  )
                  .map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nome do Bolão</Label>
            <Input
              id="name"
              name="name"
              defaultValue={pool.name}
              required
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-slate-700">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={pool.description || ""}
              className="min-h-[100px] rounded-xl border-slate-200 resize-none"
            />
          </div>

          {!pool.is_general && (
            <div className="space-y-2">
              <Label htmlFor="password" title="Altere a senha" className="text-sm font-bold text-slate-700">Nova Senha (Opcional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Deixe em branco para manter a senha atual"
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
          )}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Ocultar sem palpites</p>
                <p className="text-xs text-slate-500">Esconder participantes que não enviaram palpites</p>
              </div>
            </div>
            <Switch 
              checked={hidePending} 
              onCheckedChange={setHidePending}
              className="data-[state=checked]:bg-emerald-500" 
            />
            <input type="hidden" name="hide_pending" value={hidePending ? "on" : "off"} />
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:flex-1 h-12 rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto sm:flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
