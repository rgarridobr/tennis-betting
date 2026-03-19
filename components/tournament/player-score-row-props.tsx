import { cn } from '@/lib/utils';

interface PlayerScoreRowProps {
  player: any;
  label: string;
  score: number;
  setScore: (value: number) => void;
  winnerId: number;
  maxSets: number;
  options: number[];
}

export function PlayerScoreRow({ player, label, score, setScore, winnerId, maxSets, options }: PlayerScoreRowProps) {
  const isWinner = winnerId === player?.id;

  return (
    <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 gap-2">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">{label}</span>
        <span
          className={cn('text-sm font-black truncate', isWinner ? 'text-emerald-600' : 'text-slate-700')}
        >
          {player?.display_name || player?.name || label}
        </span>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {options.map((opt) => {
          const disabled = (isWinner && opt !== maxSets) || (!isWinner && opt === maxSets);

          return (
            <div key={`${player?.id}-${opt}`} className={cn(disabled && 'cursor-not-allowed')}>
              <button
                onClick={() => setScore(opt)}
                disabled={disabled}
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-black transition-all border-2 text-sm',
                  'disabled:opacity-30 disabled:pointer-events-none',
                  score === opt
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600',
                )}
              >
                {opt}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}