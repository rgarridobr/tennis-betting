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
import { PlayerScoreRow } from './player-score-row-props';

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
<div className="flex flex-col gap-4">
  <PlayerScoreRow
    player={p1}
    label="Jogador 1"
    score={score1}
    setScore={setScore1}
    winnerId={winnerId}
    maxSets={maxSets}
    options={options}
  />

  <PlayerScoreRow
    player={p2}
    label="Jogador 2"
    score={score2}
    setScore={setScore2}
    winnerId={winnerId}
    maxSets={maxSets}
    options={options}
  />
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
