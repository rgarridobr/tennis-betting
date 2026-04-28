"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tournament } from "@/lib/data";

interface TournamentFilterProps {
  tournaments: Tournament[];
  currentTournamentId?: number;
}

export function TournamentFilter({ tournaments, currentTournamentId }: TournamentFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overall") {
      params.delete("tournamentId");
    } else {
      params.set("tournamentId", value);
    }
    router.push(`/boloes/estadual?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-[250px]">
      <Select 
        defaultValue={currentTournamentId ? String(currentTournamentId) : "overall"} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 font-medium shadow-sm">
          <SelectValue placeholder="Filtrar por Torneio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="overall">Pontuação Geral</SelectItem>
          {tournaments.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
