'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface SetPredictionScoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  p1: any;
  p2: any;
  winnerId: number;
  initialScore?: string;
  category?: string;
  onSave: (winnerId: number, score: string) => void;
}

export function SetPredictionScoreDialog({
  isOpen,
  onOpenChange,
  p1,
  p2,
  winnerId,
  initialScore,
  category = 'GRAND_SLAM',
  onSave,
}: SetPredictionScoreDialogProps) {
  const isGrandSlam = category === 'GRAND_SLAM';
  const maxSets = isGrandSlam ? 3 : 2;
  const options = Array.from({ length: maxSets + 1 }, (_, i) => i);

  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);

  useEffect(() => {
    if (initialScore && initialScore.includes('-')) {
      const [s1, s2] = initialScore.split('-').map(Number);
      setScore1(isNaN(s1) ? 0 : s1);
      setScore2(isNaN(s2) ? 0 : s2);
    } else {
        // Default values: winner gets maxSets, loser gets 0 or 1
        if (winnerId === p1?.id) {
            setScore1(maxSets);
            setScore2(0);
        } else if (winnerId === p2?.id) {
            setScore1(0);
            setScore2(maxSets);
        }
    }
  }, [initialScore, winnerId, p1?.id, p2?.id, maxSets, isOpen]);

  const isValid = () => {
    if (winnerId === p1?.id) {
      return score1 === maxSets && score2 < maxSets;
    }
    if (winnerId === p2?.id) {
      return score2 === maxSets && score1 < maxSets;
    }
    return false;
  };

  const handleSave = () => {
    if (!isValid()) return;
    onSave(winnerId, `${score1}-${score2}`);
    onOpenChange(false);
  };

  const winner = winnerId === p1?.id ? p1 : p2;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8">
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            Placar da Final
          </DialogTitle>
          <p className="text-slate-500 font-medium">
            Defina quantos sets cada jogador vencerá na final.
            <br />
            O campeão deve ter <span className="text-emerald-600 font-bold">{maxSets}</span> sets.
          </p>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Jogador 1</span>
                <span className={cn("text-sm font-black truncate max-w-[150px]", winnerId === p1?.id ? "text-emerald-600" : "text-slate-700")}>
                  {p1?.display_name || p1?.name || 'Jogador 1'}
                </span>
              </div>
              <div className="flex gap-1">
                {options.map((opt) => (
                  <button
                    key={`p1-${opt}`}
                    onClick={() => setScore1(opt)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-black transition-all border-2",
                      score1 === opt
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                        : "bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Jogador 2</span>
                <span className={cn("text-sm font-black truncate max-w-[150px]", winnerId === p2?.id ? "text-emerald-600" : "text-slate-700")}>
                  {p2?.display_name || p2?.name || 'Jogador 2'}
                </span>
              </div>
              <div className="flex gap-1">
                {options.map((opt) => (
                  <button
                    key={`p2-${opt}`}
                    onClick={() => setScore2(opt)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-black transition-all border-2",
                      score2 === opt
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                        : "bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleSave}
            disabled={!isValid()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-2xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Placar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
