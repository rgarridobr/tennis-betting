'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Home, Users, LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/actions/auth'
import type { User } from '@/lib/auth'

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const navItems = [
    { href: '/admin', label: 'Home', icon: Home },
    { href: '/admin/torneios', label: 'Torneios', icon: Trophy },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  ]

  return (
    // <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 border-b-2">
         <header className="sticky top-0 z-50 bg-gradient-to-br from-[#071f1a] via-[#0a3a33] to-[#0d5a4d] backdrop-blur-xl "> 

      <div className="container mx-auto px-4 md:px-32 h-20 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/admin" className="flex items-center gap-2.5 text-emerald-600 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="hidden sm:inline font-black text-xl tracking-tight text-slate-900">TennisPool</span>
        </Link>

        {/* Navigation - Center */}
        <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info - Right */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-1">
             <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Administrador</p>
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
              <DropdownMenuItem
                onSelect={() => logoutAction()}
                className="cursor-pointer"
                variant="destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
