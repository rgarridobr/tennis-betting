"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tournament } from "@/lib/data";
import { useTranslations } from "next-intl";

interface TournamentFilterProps {
  tournaments: Tournament[];
  currentTournamentId?: number;
}

export function TournamentFilter({ tournaments, currentTournamentId }: TournamentFilterProps) {
  const t = useTranslations("pools");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overall") {
      params.delete("tournamentId");
    } else {
      params.set("tournamentId", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-[250px]">
      <Select 
        defaultValue={currentTournamentId ? String(currentTournamentId) : "overall"} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 font-medium shadow-sm">
          <SelectValue placeholder={t("filterByTournament")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="overall">{t("filterOverall")}</SelectItem>
          {tournaments.map((tournament) => (
            <SelectItem key={tournament.id} value={String(tournament.id)}>
              {tournament.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
