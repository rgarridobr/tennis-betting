"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { updateStartDateTournamentAction } from "@/lib/actions/admin";
import { useTranslations } from "next-intl";

interface Props {
  tournamentId: number;
  currentDate: Date;
  hasFinished: boolean;
}

export function EditTournamentDateModal({
  tournamentId,
  currentDate,
  hasFinished,
}: Props) {
  const t = useTranslations("admin");
  const tButtons = useTranslations("buttons");
  const [date, setDate] = useState<Date | undefined>(
    toUTCFromBrasilia(currentDate),
  );
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSave() {
    if (!date) return;
    try {
      setLoading(true);
      const response = await updateStartDateTournamentAction(
        tournamentId,
        format(date, "yyyy-MM-dd HH:mm:ss"),
      );

      if (!response.success) {
        throw new Error("Failed to update tournament date");
      }
      toast.success(t("date.toastSuccess"));
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("date.toastError"));
    } finally {
      setLoading(false);
    }
  }

  function toUTCFromBrasilia(date: Date) {
    const offset = 3 * 60;
    return new Date(date.getTime() + offset * 60 * 1000);
  }

  if (hasFinished) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white rounded-2xl bg-white/5 backdrop-blur-md font-bold h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base"
        >
          <Calendar className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{t("date.changeDateTime")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[420px] rounded-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-black text-lg sm:text-xl">
            {t("date.changeDateTime")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <Label
              htmlFor="start_date"
              className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] sm:text-xs tracking-widest"
            >
              <Calendar className="w-4 h-4 text-emerald-500" /> {t("date.startDateTime")}
            </Label>
            <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""}
              onChange={(e) =>
                setDate(e.target.value ? new Date(e.target.value) : undefined)
              }
              required
              className="w-full h-12 bg-slate-50 border-2 border-slate-100 focus:ring-emerald-500 rounded-2xl font-bold text-slate-700 text-sm sm:text-base px-3 sm:px-4"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-xl font-bold"
            disabled={loading}
          >
            {loading ? tButtons("saving") : t("date.saveChanges")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
