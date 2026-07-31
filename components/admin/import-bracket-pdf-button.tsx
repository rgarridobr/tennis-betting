"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { FileUp, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { importTournamentBracketPdfAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportBracketPdfButtonProps {
  tournamentId: number;
  isReady: boolean;
}

export function ImportBracketPdfButton({
  tournamentId,
  isReady,
}: ImportBracketPdfButtonProps) {
  const t = useTranslations("admin");
  const tButtons = useTranslations("buttons");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    if (file.type && file.type !== "application/pdf") {
      toast.error(t("sync.importPdfInvalid"));
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tournamentId", String(tournamentId));
      formData.append("pdf", selectedFile);

      const result = await importTournamentBracketPdfAction(formData);

      if (result.success) {
        const updatedCount =
          "updatedCount" in result && typeof result.updatedCount === "number"
            ? result.updatedCount
            : 0;
        const reviewCount =
          "reviewCount" in result && typeof result.reviewCount === "number"
            ? result.reviewCount
            : 0;
        const reviewPlayers =
          "reviewPlayers" in result && Array.isArray(result.reviewPlayers)
            ? result.reviewPlayers
            : [];

        if (reviewCount > 0) {
          toast.warning(
            t("sync.toastBracketImportedWithReview", {
              count: updatedCount,
              reviewCount,
              names: reviewPlayers.join(", "),
            }),
          );
        } else {
          toast.success(t("sync.toastBracketSuccess", { count: updatedCount }));
        }
        setSelectedFile(null);
      } else {
        toast.error(result.error || t("sync.importPdfError"));
      }
    } catch (error) {
      console.error("Error importing bracket PDF:", error);
      toast.error(t("sync.toastServerError"));
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        variant="outline"
        className="bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 font-bold rounded-full px-6 transition-all"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileUp className="w-4 h-4 mr-2" />
        )}
        {t("sync.importPdf")}
      </Button>

      <Dialog
        open={!!selectedFile}
        onOpenChange={(open) => {
          if (!open && !loading) setSelectedFile(null);
        }}
      >
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
          <DialogHeader className="pt-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900">
              {t("sync.importPdfTitle")}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium px-4">
              {t("sync.importPdfDesc", { filename: selectedFile?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-2">
            <Button
              variant="outline"
              onClick={() => setSelectedFile(null)}
              disabled={loading}
              className="flex-1 rounded-xl font-bold h-12 border-2"
            >
              {tButtons("cancel")}
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading}
              variant="default"
              className="flex-1 rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t("sync.yesImportPdf")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
