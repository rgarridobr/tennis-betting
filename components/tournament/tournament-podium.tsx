import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RankingEntry } from '@/lib/data';

export function PodiumMedal({ place }: { place: 1 | 2 | 3 }) {
  const gradients = {
    1: ['#FEF08A', '#D97706'], // yellow-200 -> amber-600
    2: ['#F1F5F9', '#64748B'], // slate-100 -> slate-500
    3: ['#FED7AA', '#C2410C'], // orange-200 -> orange-700
  };

  const ringGradients = {
    1: ['#FDE047', '#92400E'], 
    2: ['#E2E8F0', '#334155'], 
    3: ['#FDBA74', '#7C2D12'], 
  };

  const textColors = {
    1: '#78350F', 
    2: '#0F172A', 
    3: '#431407', 
  };

  const g = gradients[place];
  const rg = ringGradients[place];
  const tc = textColors[place];

  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md transition-transform hover:scale-110">
      <defs>
        <linearGradient id={`medalGrad-${place}`} x1="16" y1="16" x2="48" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={g[0]} />
          <stop offset="1" stopColor={g[1]} />
        </linearGradient>
        <linearGradient id={`ringGrad-${place}`} x1="10" y1="10" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={rg[0]} />
          <stop offset="1" stopColor={rg[1]} />
        </linearGradient>
      </defs>

      {/* Ribbons */}
      <path d="M12 0L24 28H40L52 0H38L32 14L26 0H12Z" fill="#1E40AF" />
      <path d="M38 0L32 14L26 0H38Z" fill="#1E3A8A" />
      <path d="M16 0L24 20L28 12L22 0H16Z" fill="#60A5FA" opacity="0.3" />
      <path d="M48 0L40 20L36 12L42 0H48Z" fill="#60A5FA" opacity="0.3" />

      {/* Outer Ring */}
      <circle cx="32" cy="38" r="22" fill={`url(#ringGrad-${place})`} />
      
      {/* Inner Core */}
      <circle cx="32" cy="38" r="18" fill={`url(#medalGrad-${place})`} />
      
      {/* Inner glow/reflection stroke */}
      <circle cx="32" cy="38" r="16" fill="transparent" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="32" cy="38" r="20" fill="transparent" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" />

      {/* Place Text */}
      <text x="32" y="47" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="900" fill={tc} textAnchor="middle" style={{ fontStyle: 'italic' }}>
        {place}
      </text>
    </svg>
  );
}

interface TournamentPodiumProps {
  ranking: RankingEntry[];
  isFinished?: boolean;
  title?: string;
}

export function TournamentPodium({ ranking, isFinished, title }: TournamentPodiumProps) {
  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {title || (isFinished ? 'Pódio do Torneio' : 'Liderança Atual')}
        </h2>
        <Badge className="bg-amber-100 text-amber-700 font-black px-4 py-1.5 rounded-full border-none">
          RANKING
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end pt-4">
        {ranking.map((user, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;
          
          const colors = isFirst 
            ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-400 text-amber-950 shadow-amber-500/30' 
            : isSecond 
            ? 'bg-gradient-to-br from-slate-200 to-slate-400 border-slate-300 text-slate-900 shadow-slate-400/20'
            : 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-400 text-orange-950 shadow-orange-500/20';

          const orderClass = isFirst ? 'md:order-2' : isSecond ? 'md:order-1' : 'md:order-3';
          const heightClass = 'min-h-[6rem]';

          return (
            <Card key={user.user_id} className={`relative overflow-hidden border-2 shadow-xl transition-all hover:scale-[1.02] ${colors} ${orderClass} ${heightClass} rounded-2xl`}>
              <div className="absolute -bottom-6 -right-4 opacity-[0.1] pointer-events-none select-none overflow-hidden">
                <span className="font-black text-8xl leading-none tracking-tighter" style={{ WebkitTextStroke: '1px currentColor', color: 'transparent' }}>
                  {index + 1}
                </span>
              </div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <PodiumMedal place={(index + 1) as 1 | 2 | 3} />
                    <h3 className="text-lg font-black line-clamp-1 leading-tight">{user.user_name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">Pontos</span>
                      <span className="text-xl font-black drop-shadow-sm leading-tight">{user.total_points}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-current opacity-10" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">Acertos</span>
                      <span className="text-sm font-bold leading-tight">{user.correct_predictions}/{user.total_predictions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
