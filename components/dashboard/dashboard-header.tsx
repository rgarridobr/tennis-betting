"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Medal, Target, Trophy, FileText } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserCount } from "@/lib/actions/users";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  user: User | null;
  activeTournamentId?: number | null;
}

import { CompleteRegistrationForm } from "@/components/auth/complete-registration-form";

export function DashboardHeader({
  user,
  activeTournamentId,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    getUserCount().then(setTotalUsers);
  }, []);

  const displayName = user?.nickname || user?.name || "Visitante";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems = [
    { href: "/torneios", label: "Torneios", icon: Trophy },
    { href: "/grupos", label: "Grupos", icon: Target },
    { href: "/ranking", label: "Ranking", icon: Medal, isRanking: true },
    { href: "/regras", label: "Regras", icon: FileText },
  ];

  return (
    <>
      {user && !user.is_admin && (!user.state || !user.city || !user.tennis_club) && (
        <CompleteRegistrationForm
          user={{
            name: user.name,
            nickname: user.nickname,
            tennis_club: user.tennis_club,
            tennis_club_id: user.tennis_club_id,
            tennis_club_custom: user.tennis_club_custom,
            state: user.state,
            city: user.city,
          }}
        />
      )}
      <header className="sticky top-0 z-50 bg-gradient-to-br from-[#041a16] via-[#062c25] to-[#005e50] backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-32 h-20 flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-[#6EC46C]/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline font-black text-xl tracking-tight text-[#D32D18]">
              TennisPool
            </span>
          </Link>

          {/* Navigation - Center */}
          <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/ranking" &&
                  pathname.startsWith(item.href)) ||
                (item.href === "/ranking" && pathname.startsWith("/ranking"));

              if (item.isRanking) {
                return (
                  <DropdownMenu key={item.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all flex items-center gap-2 outline-none ${
                          isActive
                            ? "text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] bg-white"
                            : "text-white hover:text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/ranking" className="cursor-pointer">
                          Ranking Geral
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/ranking/torneio"
                          className="cursor-pointer"
                        >
                          Ranking por Torneio
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all flex items-center gap-2 ${
                    isActive
                      ? "text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] bg-white"
                      : "text-white hover:text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-light rounded-lg transition-all flex items-center gap-2 text-white hover:text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] hover:bg-white/10 cursor-help hidden lg:flex">
                  <svg
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path d="M16 21.416c-5.035 0.022-9.243 3.537-10.326 8.247l-0.014 0.072c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c0.825-3.658 4.047-6.35 7.897-6.35s7.073 2.692 7.887 6.297l0.010 0.054c0.127 0.566 0.625 0.982 1.221 0.982 0.69 0 1.25-0.559 1.25-1.25 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008c-1.098-4.78-5.305-8.295-10.337-8.316h-0.002zM9.164 11.102c0 0 0 0 0 0 2.858 0 5.176-2.317 5.176-5.176s-2.317-5.176-5.176-5.176c-2.858 0-5.176 2.317-5.176 5.176v0c0.004 2.857 2.319 5.172 5.175 5.176h0zM9.164 3.25c0 0 0 0 0 0 1.478 0 2.676 1.198 2.676 2.676s-1.198 2.676-2.676 2.676c-1.478 0-2.676-1.198-2.676-2.676v0c0.002-1.477 1.199-2.674 2.676-2.676h0zM22.926 11.102c2.858 0 5.176-2.317 5.176-5.176s-2.317-5.176-5.176-5.176c-2.858 0-5.176 2.317-5.176 5.176v0c0.004 2.857 2.319 5.172 5.175 5.176h0zM22.926 3.25c1.478 0 2.676 1.198 2.676 2.676s-1.198 2.676-2.676 2.676c-1.478 0-2.676-1.198-2.676-2.676v0c0.002-1.477 1.199-2.674 2.676-2.676h0zM31.311 19.734c-0.864-4.111-4.46-7.154-8.767-7.154-0.395 0-0.784 0.026-1.165 0.075l0.045-0.005c-0.93-2.116-3.007-3.568-5.424-3.568-2.414 0-4.49 1.448-5.407 3.524l-0.015 0.038c-0.266-0.034-0.58-0.057-0.898-0.063l-0.009-0c-4.33 0.019-7.948 3.041-8.881 7.090l-0.012 0.062c-0.018 0.080-0.029 0.173-0.029 0.268 0 0.691 0.56 1.251 1.251 1.251 0.596 0 1.094-0.417 1.22-0.975l0.002-0.008c0.684-2.981 3.309-5.174 6.448-5.186h0.001c0.144 0 0.282 0.020 0.423 0.029 0.056 3.218 2.679 5.805 5.905 5.805 3.224 0 5.845-2.584 5.905-5.794l0-0.006c0.171-0.013 0.339-0.035 0.514-0.035 3.14 0.012 5.765 2.204 6.442 5.14l0.009 0.045c0.126 0.567 0.625 0.984 1.221 0.984 0.69 0 1.249-0.559 1.249-1.249 0-0.094-0.010-0.186-0.030-0.274l0.002 0.008zM16 18.416c-0 0-0 0-0.001 0-1.887 0-3.417-1.53-3.417-3.417s1.53-3.417 3.417-3.417c1.887 0 3.417 1.53 3.417 3.417 0 0 0 0 0 0.001v-0c-0.003 1.886-1.53 3.413-3.416 3.416h-0z" />
                  </svg>
                  {totalUsers !== null ? `${totalUsers}` : "..."}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Número de inscritos no site</p>
              </TooltipContent>
            </Tooltip>
          </nav>

          {/* User Avatar - Right */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <p className="text-sm font-black text-[#D32D18] leading-none">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">
                    Participante
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden hover:bg-transparent"
                    >
                      <Avatar className="h-11 w-11 rounded-2xl">
                        <AvatarFallback className="bg-slate-100 text-emerald-500 font-black rounded-2xl border-2 border-emerald-100">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {/* <DropdownMenuSeparator /> */}
                    {/* <DropdownMenuItem asChild>
                    <Link href="/meus-palpites">Meus Palpites</Link>
                  </DropdownMenuItem> */}
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">Meu Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => logoutAction()}
                      className="cursor-pointer"
                      variant="destructive"
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="font-bold text-white hover:text-[#6EC46C] hover:bg-white/10 rounded-xl hidden sm:flex"
                >
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button
                  className="bg-[#6EC46C] text-white hover:bg-[#6EC46C]/90 font-bold px-6 rounded-xl shadow-lg shadow-[#6EC46C]/20"
                  asChild
                >
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
