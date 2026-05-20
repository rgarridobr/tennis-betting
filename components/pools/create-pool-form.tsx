"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoolAction } from "@/lib/actions/pools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Trophy, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tournament } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreatePoolForm({ isAdmin, tournaments = [], onCancel }: { isAdmin: boolean; tournaments?: Tournament[]; onCancel?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isGeneral, setIsGeneral] = useState(isAdmin);
  const [hidePending, setHidePending] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createPoolAction(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success) {
      router.push(`/grupos/${result.poolId}`);
    }
  };

  return (
    <div className="w-full mx-auto pt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tournament_id" className="text-sm font-bold text-slate-700">Torneio</Label>
            <Select name="tournament_id" required>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 font-medium">
                <SelectValue placeholder="Selecione um torneio" />
              </SelectTrigger>
              <SelectContent>
                {tournaments
                  .filter((t) => 
                    ['active', 'OPEN', 'IN_PROGRESS', 'LOCKED', 'upcoming', 'published', 'UPCOMING', 'STANDBY'].includes(t.status)
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
            <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nome do Grupo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Amigos do Tênis, Grupo da Firma..."
              required
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-slate-700">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva o objetivo ou as regras do seu grupo..."
              className="min-h-[100px] rounded-xl border-slate-200 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_link" className="text-sm font-bold text-slate-700">Link do Grupo de WhatsApp (Opcional)</Label>
            <Input
              id="whatsapp_link"
              name="whatsapp_link"
              placeholder="https://chat.whatsapp.com/..."
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Grupo Privado</p>
                <p className="text-xs text-slate-500">Exigir senha para novos membros</p>
              </div>
            </div>
            <Switch 
              checked={isPrivate} 
              onCheckedChange={(checked) => {
                setIsPrivate(checked);
                if (isAdmin) setIsGeneral(!checked);
              }}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {isPrivate && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="password" title="Defina uma senha" className="text-sm font-bold text-slate-700">Senha de Acesso</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite a senha que seus amigos usarão"
                required={isPrivate}
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Grupo Geral</p>
                  <p className="text-xs text-slate-500">Visível para todos os usuários</p>
                </div>
              </div>
              <Switch 
                checked={isGeneral} 
                onCheckedChange={(checked) => {
                  setIsGeneral(checked);
                  setIsPrivate(!checked);
                }}
                className="data-[state=checked]:bg-emerald-500" 
              />
              <input type="hidden" name="is_general" value={isGeneral ? "on" : "off"} />
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

          <div className="pt-4 flex flex-col md:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto md:flex-1 h-12 rounded-xl font-bold"
              onClick={onCancel || (() => router.back())}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full md:w-auto md:flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Grupo"}
            </Button>
          </div>
        </form>
    </div>
  );
}
