'use client'

import { LayoutList, GitMerge, Medal } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface TournamentViewToggleProps {
  currentView: string
}

export function TournamentViewToggle({ currentView }: TournamentViewToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
      <Button
        variant={currentView === 'bracket' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setView('bracket')}
        className={`rounded-xl px-4 py-2 h-auto text-xs font-black uppercase tracking-wider ${
          currentView === 'bracket' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        <GitMerge className="w-3.5 h-3.5 mr-2" />
        Chaveamento
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setView('list')}
        className={`rounded-xl px-4 py-2 h-auto text-xs font-black uppercase tracking-wider ${
          currentView === 'list' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        <LayoutList className="w-3.5 h-3.5 mr-2" />
        Lista
      </Button>
      <Button
        variant={currentView === 'ranking' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setView('ranking')}
        className={`rounded-xl px-4 py-2 h-auto text-xs font-black uppercase tracking-wider ${
          currentView === 'ranking' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:bg-slate-200'
        }`}
      >
        <Medal className="w-3.5 h-3.5 mr-2" />
        Ranking
      </Button>
    </div>
  )
}
