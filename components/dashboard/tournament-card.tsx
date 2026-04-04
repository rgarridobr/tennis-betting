import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Icon, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import type { Tournament } from "@/lib/data";
import { tennisBall } from "@lucide/lab";

interface TournamentCardProps {
  tournament: Tournament;
  href?: string;
}

const surfaceColors: Record<string, string> = {
  Hard: "bg-blue-500/90 text-white",
  Clay: "bg-orange-500/90 text-white",
  Grass: "bg-emerald-600/90 text-white",
};

const surfaceLabels: Record<string, string> = {
  Hard: "Hard Court",
  Clay: "Saibro",
  Grass: "Grama",
};

const surfaceImages: Record<string, string> = {
  Clay: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  Grass:
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
  Hard: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export function TournamentCard({ tournament, href }: TournamentCardProps) {
  const isLockedByDate = new Date(tournament.start_date) <= new Date();
  const isFinished =
    tournament.status === "finished" ||
    tournament.status === "FINISHED" ||
    tournament.status === "completed";

  const statusLabel = isFinished
    ? "Finalizado"
    : isLockedByDate
      ? "Em Andamento"
      : tournament.status === "active" || tournament.status === "OPEN"
        ? "Apostas Abertas"
        : tournament.status === "STANDBY"
          ? "Agendado"
          : tournament.status === "UPCOMING"
            ? "Preparando chaveamento"
            : "";

  const statusColor = isFinished
    ? "bg-slate-600/95 text-white border-slate-500/50"
    : isLockedByDate
      ? "bg-blue-600/95 text-white border-blue-500/50"
      : tournament.status === "active" || tournament.status === "OPEN"
        ? "bg-emerald-600/95 text-white border-emerald-500/50"
        : tournament.status === "STANDBY"
          ? "bg-amber-500/95 text-white border-amber-400/50"
          : "bg-purple-600/95 text-white border-purple-500/50";

  const pulseEffect =
    (isLockedByDate && !isFinished) ||
    tournament.status === "active" ||
    tournament.status === "OPEN";

  const imageUrl =
    tournament.image_url ||
    surfaceImages[tournament.surface] ||
    surfaceImages.Hard;

  const getCategory = (category: string) => {
    switch (category) {
      case "GRAND_SLAM":
        return "Grand Slam";
      case "MASTERS_1000":
        return "Masters 1000";
      case "ATP_500":
        return "ATP 500";
      case "ATP_250":
        return "ATP 250";
      default:
        return category;
    }
  };

  return (
    <Link
      href={href || `/torneios/${tournament.id}`}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-[2rem]"
    >
      <Card className="pt-0 overflow-hidden border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 group hover:-translate-y-1.5 h-full flex flex-col rounded-[2rem]">
        {" "}
        <div className="relative h-60 shrink-0 overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={tournament.name}
            className="w-full h-full object-cover rounded-t-[2rem] transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge
              variant="outline"
              className={`backdrop-blur-md border ${statusColor} px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold shadow-lg flex items-center gap-2`}
            >
              {pulseEffect && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
              {statusLabel}
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 flex flex-col items-start bg-gradient-to-t from-slate-900/90 hover:from-slate-900/95 transition-colors duration-500 to-transparent">
            <Badge
              className={`mb-3 ${surfaceColors[tournament.surface] || "bg-slate-500 text-white"} border-none font-bold px-3 py-1 shadow-sm`}
            >
              {surfaceLabels[tournament.surface] || tournament.surface}
            </Badge>
            <h3 className="font-bold text-white text-2xl drop-shadow-md leading-tight line-clamp-2 transform transition-transform duration-500 group-hover:translate-x-1">
              {tournament.name}
            </h3>
          </div>
        </div>
        <CardContent className="p-0 flex-1 flex flex-col justify-between bg-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-[0.02] transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110 pointer-events-none text-slate-900">
            <Trophy size={140} strokeWidth={1} />
          </div>
          {/* Decorative background element */}

          <div className="flex flex-col text-sm font-medium text-slate-600 relative z-10 w-full">
            <div className="flex items-center gap-3 p-2.5 rounded-xl">
              <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-600 shadow-sm shrink-0">
                <Icon iconNode={tennisBall} className="w-4 h-4" />
              </div>
              <span className="text-slate-700 font-semibold truncate">
                {getCategory(tournament.category)}
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl">
              <div className="p-2 rounded-lg bg-blue-100/80 text-blue-600 shadow-sm shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-slate-700 truncate">
                {tournament.location}
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl">
              <div className="p-2 rounded-lg bg-amber-100/80 text-amber-600 shadow-sm shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-slate-700 font-medium truncate">
                {formatDate(tournament.start_date)} -{" "}
                {formatDate(tournament.end_date)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
