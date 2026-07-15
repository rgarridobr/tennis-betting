"use client";

import { useState } from "react";
import { joinPoolAction } from "@/lib/actions/pools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

interface JoinPrivatePoolGateProps {
  poolId: number;
  poolName: string;
}

export function JoinPrivatePoolGate({ poolId, poolName }: JoinPrivatePoolGateProps) {
  const t = useTranslations("pools");
  const tButtons = useTranslations("buttons");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const result = await joinPoolAction(poolId, password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2rem] bg-white overflow-hidden">
        <div className="h-16 flex items-center justify-center relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>
        
        <CardHeader className="text-center pt-6">
          <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
            {t("gateTitle")}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-2">
            {t("gateDescription", { name: poolName })}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-slate-700">{t("accessPassword")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("gatePasswordPlaceholder")}
                required
                className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all text-base"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? t("joining") : t("participate")}
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full h-12 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Link href="/grupos">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {tButtons("back")}
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
