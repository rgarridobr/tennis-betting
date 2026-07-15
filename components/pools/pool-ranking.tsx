"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Filter } from "lucide-react";
import type { RankingEntry } from "@/lib/data";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface PoolRankingProps {
  ranking: RankingEntry[];
  currentUserId: number;
  initialHidePending?: boolean;
}

export function PoolRanking({ ranking, currentUserId, initialHidePending = true }: PoolRankingProps) {
  const t = useTranslations("pools");
  const [hidePending, setHidePending] = useState(initialHidePending);

  // Sync state with props when database updates via server actions
  useEffect(() => {
    setHidePending(initialHidePending);
  }, [initialHidePending]);

  const filteredRanking = hidePending 
    ? ranking.filter(entry => entry.has_predictions !== false) 
    : ranking;
  if (ranking.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white rounded-[2.5rem]">
        <CardContent className="py-16 text-center">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t("rankingEmptyTitle")}</h2>
          <p className="text-slate-500">{t("rankingEmptyBody")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            {t("rankingFull")}
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {filteredRanking.length > 0 ? (
              filteredRanking.map((entry) => (
                <RankingRow
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                />
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Filter className="w-12 h-12 text-slate-200" />
                <p className="text-slate-400 font-bold italic text-sm">
                  {hidePending 
                    ? t("rankingFilteredEmpty")
                    : t("rankingNoData")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RankingRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  const t = useTranslations("pools");
  const tCommon = useTranslations("common");
  const hasPredictions = entry.has_predictions !== false;
  const accuracy =
    entry.total_predictions > 0 ? Math.round((entry.correct_predictions / entry.total_predictions) * 100) : 0;

  return (
    <div
      className={`flex items-center justify-between px-6 md:px-8 py-6 transition-colors ${
        !hasPredictions 
          ? "opacity-60" 
          : isCurrentUser 
            ? "bg-emerald-50/50" 
            : "hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <div
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black shrink-0 ${
            !hasPredictions
              ? "bg-slate-100 text-slate-400"
              : entry.rank === 1
                ? "bg-amber-400 text-white"
                : entry.rank === 2
                  ? "bg-slate-400 text-white"
                  : entry.rank === 3
                    ? "bg-orange-400 text-white"
                    : "bg-slate-100 text-slate-500"
          }`}
        >
          {hasPredictions ? entry.rank : "-"}
        </div>
        <div>
          <p className="font-black text-slate-900 flex items-center gap-2 leading-none mb-2 text-sm md:text-base">
            {entry.user_name}
            {isCurrentUser && (
              <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] h-4 px-1.5">{tCommon("youUpper")}</Badge>
            )}
          </p>
          {hasPredictions ? (
            <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" /> {t("rankingHits", { correct: entry.correct_predictions, total: entry.total_predictions })}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {t("rankingAccuracy", { n: accuracy })}
              </span>
            </div>
          ) : (
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 italic">
              {t("rankingIncomplete")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-xl md:text-2xl font-black leading-none ${hasPredictions ? "text-slate-900" : "text-slate-400"}`}>
            {hasPredictions ? entry.total_points : "0"}
          </p>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tCommon("points")}</p>
        </div>
      </div>
    </div>
  );
}
