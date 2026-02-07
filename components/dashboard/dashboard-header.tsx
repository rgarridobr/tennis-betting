import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import type { User } from '@/lib/auth'

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/dashboard" className="flex items-center gap-2.5 text-emerald-600 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:inline font-black text-xl tracking-tight text-slate-900">Bolão de Tênis</span>
        </Link>

        {/* Navigation - Center */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/torneios" 
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            Torneios
          </Link>
          <Link 
            href="/meus-palpites" 
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            Meus Palpites
          </Link>
          <Link 
            href="/ranking" 
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            Ranking
          </Link>
          {user.is_admin && (
            <Link 
              href="/admin" 
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* User Avatar - Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-1">
             <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Participante</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden hover:bg-transparent">
                <Avatar className="h-11 w-11 rounded-2xl">
                  <AvatarFallback className="bg-slate-100 text-emerald-600 font-black rounded-2xl border-2 border-emerald-100">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/meus-palpites">Meus Palpites</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/perfil">Meu Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    Sair
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
