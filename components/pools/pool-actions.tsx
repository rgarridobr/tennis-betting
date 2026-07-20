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
import { Lock, LogOut, Users, Share2, AlertCircle, Edit } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { EditPoolDialog } from "./edit-pool-dialog";
import type { Pool, Tournament } from "@/lib/data";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface PoolActionsProps {
  pool: Pool;
  tournaments: Tournament[];
  isMember: boolean;
  isCreator: boolean;
  isAuthenticated?: boolean;
}

export function PoolActions({ pool, tournaments, isMember, isCreator, isAuthenticated = true }: PoolActionsProps) {
  const t = useTranslations("pools");
  const tButtons = useTranslations("buttons");
  const poolId = Number(pool.id);
  const poolName = pool.name;
  const needsPassword = !!pool.password_hash;

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
      toast.success(t("joinedToast", { name: poolName }));
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
      toast.success(t("leftToast", { name: poolName }));
      setShowLeaveDialog(false);
    } else {
      toast.error(t("leaveError"));
    }
    setIsLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  };

  return (
    <>
      {isMember ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {isCreator && (
            <Button 
              variant="outline" 
              className="rounded-xl font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t("edit")}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="rounded-xl font-bold border-slate-200 w-full sm:w-auto"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t("share")}
          </Button>
          <Button 
            variant="ghost" 
            className="rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            onClick={handleLeave}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("leave")}
          </Button>
        </div>
      ) : isAuthenticated ? (
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-8 h-12 w-full sm:w-auto"
          onClick={handleJoin}
          disabled={isLoading}
        >
          <Users className="w-5 h-5 mr-2" />
          {needsPassword ? t("joinWithPassword") : t("joinGroup")}
        </Button>
      ) : (
        <Button
          asChild
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold px-8 h-12 w-full sm:w-auto"
        >
          <Link href={`/login?redirectTo=/grupos/${poolId}`}>
            {needsPassword ? t("joinWithPassword") : t("joinGroup")}
          </Link>
        </Button>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">{t("passwordTitle")}</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t("passwordDescription")}
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
              placeholder={t("passwordInput")}
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
              {tButtons("cancel")}
            </Button>
            <Button 
              onClick={handleJoin} 
              className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              disabled={isLoading}
            >
              {isLoading ? t("validating") : t("enter")}
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
            <DialogTitle className="text-2xl font-black text-center text-slate-900">{t("leaveConfirmTitle")}</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t("leaveConfirmBody", { name: poolName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLeaveDialog(false)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              {tButtons("back")}
            </Button>
            <Button 
              onClick={confirmLeave} 
              className="flex-1 rounded-xl font-black h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-rose-100"
              disabled={isLoading}
            >
              {isLoading ? t("leaving") : t("leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditPoolDialog 
        pool={pool} 
        tournaments={tournaments} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </>
  );
}
