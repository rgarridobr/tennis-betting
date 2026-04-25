"use client";

import { useState } from "react";
import { RankingEntry } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trophy, Medal, Star } from "lucide-react";

interface PoolRankingProps {
  ranking: RankingEntry[];
  currentUserId: number;
}

export function PoolRanking({ ranking, currentUserId }: PoolRankingProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[80px] text-center font-bold text-slate-500">Pos.</TableHead>
            <TableHead className="font-bold text-slate-500">Participante</TableHead>
            <TableHead className="text-center font-bold text-slate-500">Palpites Corretos</TableHead>
            <TableHead className="text-right font-bold text-slate-500 pr-8">Pontuação Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.length > 0 ? (
            ranking.map((entry, index) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const isTop3 = index < 3;

              return (
                <TableRow
                  key={entry.user_id}
                  className={`group border-slate-50 ${isCurrentUser ? 'bg-emerald-50/50' : ''}`}
                >
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {index === 0 ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-amber-600" />
                        </div>
                      ) : index === 1 ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Medal className="w-4 h-4 text-slate-500" />
                        </div>
                      ) : index === 2 ? (
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                          <Medal className="w-4 h-4 text-orange-600" />
                        </div>
                      ) : (
                        <span className="font-bold text-slate-400">{entry.rank}º</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                        ${isCurrentUser ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {entry.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isCurrentUser ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {entry.user_name}
                          {isCurrentUser && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                              Você
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-600">
                    {entry.correct_predictions} / {entry.total_predictions}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <span className={`text-lg font-black ${isTop3 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {entry.total_points}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-1 uppercase">pts</span>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium">
                Nenhum participante pontuou ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
