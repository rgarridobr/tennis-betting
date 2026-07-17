"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreatePoolForm } from "@/components/pools/create-pool-form";
import { EditPoolDialog } from "@/components/pools/edit-pool-dialog";
import { deletePoolAction, getPoolMembersAction } from "@/lib/actions/pools";
import { Shield, Users, Trophy, Plus, Trash2, Edit3, Eye } from "lucide-react";
import type { AdminPoolEntry } from "@/lib/admin";
import type { Tournament } from "@/lib/data";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AdminPoolManagerProps {
  pools: AdminPoolEntry[];
  tournaments: Tournament[];
}

export function AdminPoolManager({ pools, tournaments }: AdminPoolManagerProps) {
  const t = useTranslations("pools");
  const tAdmin = useTranslations("admin");
  const tButtons = useTranslations("buttons");
  const tCommon = useTranslations("common");
  const tRanking = useTranslations("ranking");
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<AdminPoolEntry | null>(null);
  const [viewingMembersPool, setViewingMembersPool] = useState<AdminPoolEntry | null>(null);
  const [deletingPool, setDeletingPool] = useState<AdminPoolEntry | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | string | null>(null);

  const handleViewMembers = async (pool: AdminPoolEntry) => {
    setViewingMembersPool(pool);
    setIsLoadingMembers(true);
    try {
      const result = await getPoolMembersAction(Number(pool.id));
      if (result.success && result.members) {
        setMembers(result.members);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingPool) return;
    setIsDeleting(deletingPool.id);
    try {
      const result = await deletePoolAction(Number(deletingPool.id));
      if (result.success) {
        toast.success(t("adminGroupDeletedToast"));
        setDeletingPool(null);
        router.refresh();
      } else {
        toast.error(tCommon("error"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{tAdmin("poolsTitle")}</h2>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-4 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          {t("createNew")}
        </Button>
      </div>

      <div className="grid gap-6">
        {pools.map((pool) => (
          <Card key={pool.id} className="border-0 shadow-md rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${pool.is_general ? "bg-emerald-50 text-emerald-500" : pool.is_state_pool ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-500"}`}>
                  {pool.is_general ? <Trophy className="w-6 h-6" /> : pool.is_state_pool ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-lg text-slate-900 truncate">{pool.name}</h3>
                    {pool.is_general && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] uppercase font-black tracking-wider px-2 py-0.5">{t("generalFormTitle")}</Badge>}
                    {pool.is_state_pool && <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] uppercase font-black tracking-wider px-2 py-0.5">{tRanking("tabState")}</Badge>}
                    {!pool.is_general && !pool.is_state_pool && <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] uppercase font-black tracking-wider px-2 py-0.5">{t("privateTitle")}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-2">
                    {pool.description || t("adminNoDescription")}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-bold">
                    <span>{t("tournamentLabel", { name: pool.tournament_name || t("filterOverall") })}</span>
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" /> {t("participantsCount", { count: pool.member_count })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewMembers(pool)}
                  className="rounded-xl font-bold text-xs border-slate-200 flex items-center gap-1.5 h-10 px-4"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  {tAdmin("participants")}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPool(pool)}
                  className="rounded-xl font-bold text-xs border-slate-200 flex items-center gap-1.5 h-10 px-4"
                >
                  <Edit3 className="w-4 h-4 text-slate-500" />
                  {tButtons("edit")}
                </Button>

                {!pool.is_state_pool && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting === pool.id}
                    onClick={() => setDeletingPool(pool)}
                    className="rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 h-10 px-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    {tButtons("delete")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Criar */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">{t("createDialogTitle")}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {t("adminCreateDescription")}
            </DialogDescription>
          </DialogHeader>
          <CreatePoolForm 
            isAdmin={true} 
            tournaments={tournaments} 
            onCancel={() => setIsCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      {editingPool && (
        <EditPoolDialog
          pool={{
            id: Number(editingPool.id),
            name: editingPool.name,
            description: editingPool.description,
            creator_id: editingPool.creator_id,
            is_general: editingPool.is_general,
            password_hash: null,
            created_at: editingPool.created_at,
            tournament_id: editingPool.tournament_id,
          }}
          tournaments={tournaments}
          open={editingPool !== null}
          onOpenChange={(open) => {
            if (!open) setEditingPool(null);
          }}
        />
      )}

      {/* Modal Membros */}
      <Dialog open={viewingMembersPool !== null} onOpenChange={(open) => {
        if (!open) setViewingMembersPool(null);
      }}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              {tAdmin("participants")}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {viewingMembersPool?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {isLoadingMembers ? (
              <p className="text-center text-sm text-slate-400 py-8 font-medium">{tCommon("loading")}</p>
            ) : members.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8 font-medium">{tCommon("noResults")}</p>
            ) : (
              members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{m.user_name}</p>
                    <p className="text-slate-400 font-medium text-xs">{m.user_email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200 h-6">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deletingPool} onOpenChange={(open) => !open && setDeletingPool(null)}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-sm">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">{t("adminDeleteTitle")}</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4 mt-2">
              {t.rich("adminDeleteDescription", {
                name: deletingPool?.name ?? "",
                bold: (chunks) => <strong>{chunks}</strong>,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeletingPool(null)}
              className="flex-1 rounded-xl font-bold h-12 border-2"
              disabled={isDeleting !== null}
            >
              {tButtons("back")}
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="flex-1 rounded-xl font-black h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-rose-100"
              disabled={isDeleting !== null}
            >
              {isDeleting !== null ? tCommon("processing") : tButtons("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
