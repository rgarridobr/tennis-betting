import { ArrowDown, ArrowUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RankMovementIndicatorProps {
  movement?: number | null;
  compact?: boolean;
  className?: string;
}

export function RankMovementIndicator({ movement, compact = false, className = '' }: RankMovementIndicatorProps) {
  if (!movement) return null;

  const movedUp = movement > 0;
  const value = Math.abs(movement);
  const Icon = movedUp ? ArrowUp : ArrowDown;
  const positionLabel = value === 1 ? 'posição' : 'posições';
  const label = movedUp ? `Subiu ${value} ${positionLabel}` : `Caiu ${value} ${positionLabel}`;

  const Indicator = (
    <span
      aria-label={label}
      className={`inline-flex shrink-0 flex-col items-center justify-center rounded-md border bg-white font-black leading-none shadow-sm ${
        movedUp
          ? 'border-emerald-100 bg-emerald-50/80 text-emerald-600 shadow-emerald-100/50'
          : 'border-rose-100 bg-rose-50/80 text-rose-600 shadow-rose-100/50'
      } ${compact ? 'h-8 w-5 text-[9px]' : 'h-9 w-6 text-[10px]'} ${className}`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={3} />
      <span className="tabular-nums">{value}</span>
    </span>
  );

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{Indicator}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
