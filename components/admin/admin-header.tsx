'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminAccountPasswordDialog } from '@/components/admin/admin-account-password-dialog';
import { Trophy, Home, Users, LogOut, ClipboardList, Building2, Menu, X } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import type { User } from '@/lib/auth';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navItems = [
    { href: '/admin', label: t('navHome'), icon: Home },
    { href: '/admin/torneios', label: t('navTournaments'), icon: Trophy },
    { href: '/admin/usuarios', label: t('navUsers'), icon: Users },
    { href: '/admin/clubes', label: t('navClubs'), icon: Building2 },
    { href: '/admin/grupos', label: t('navPools'), icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-[#041a16] via-[#062c25] to-[#005e50] backdrop-blur-xl border-b border-white/5">
      <div className="container relative mx-auto px-2 sm:px-4 md:px-32 h-20 flex items-center justify-between gap-1 sm:gap-3">
        <div className="flex items-center gap-2">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-xl border border-white/15 bg-white/10 p-0 text-white hover:bg-white/15 hover:text-white lg:hidden"
                aria-label={tNav('menu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="inset-y-0 left-0 right-auto mt-0 h-full w-[82vw] max-w-xs rounded-none border-none border-r border-white/10 bg-slate-50 p-0 [&>div:first-child]:hidden">
              <DrawerHeader className="bg-gradient-to-br from-[#041a16] via-[#062c25] to-[#005e50] px-5 py-5 text-left">
                <div className="flex items-center justify-between gap-4">
                  <DrawerTitle className="flex items-center gap-3 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-[#6EC46C]/20">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <span className="font-black tracking-tight text-[#D32D18]">{tCommon('brandName')}</span>
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      className="h-9 w-9 rounded-xl border border-white/15 bg-white/10 p-0 text-white hover:bg-white/15 hover:text-white"
                      aria-label={tNav('closeMenu')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <DrawerClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-white hover:text-slate-950'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DrawerClose>
                  );
                })}
              </nav>
            </DrawerContent>
          </Drawer>

          {/* Logo - Left */}
          <Link href="/admin" className="group absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 lg:static lg:translate-x-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-[#6EC46C]/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="hidden lg:inline font-black text-xl tracking-tight text-[#D32D18]">{tCommon('brandName')}</span>
          </Link>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden flex-1 items-center justify-center gap-1 sm:gap-2 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] bg-white'
                    : 'text-white hover:text-gradient-to-br from-[#041a16] via-[#062c25] to-[#083a31] hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info - Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          <div className="hidden sm:flex flex-col items-end mr-1">
            <p className="text-sm font-black text-[#D32D18] leading-none">{user.name}</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">{t('role')}</p>
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
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <AdminAccountPasswordDialog />
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logoutAction()} className="cursor-pointer" variant="destructive">
                <LogOut className="w-4 h-4" />
                {tNav('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
