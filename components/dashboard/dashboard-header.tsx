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
import { Medal, Target, Trophy, FileText, Users, Users2, UsersRound, UserSquare } from "lucide-react";
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
    { href: "/boloes", label: "Bolões", icon: Target },
    { href: "/ranking", label: "Ranking", icon: Medal, isRanking: true },
    { href: "/regras", label: "Regras", icon: FileText },
  ];

  return (
    <>
      {user && !user.is_admin && (!user.state || !user.city) && (
        <CompleteRegistrationForm
          user={{
            name: user.name,
            nickname: user.nickname,
            tennis_club: user.tennis_club,
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

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all flex items-center gap-2 text-white hover:text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] hover:bg-white/10 cursor-help hidden lg:block">
                  <Users className="w-4 h-4" />
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
