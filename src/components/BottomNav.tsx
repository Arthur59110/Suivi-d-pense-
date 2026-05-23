'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Plus, BarChart3, PiggyBank } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isDepenses = pathname.startsWith('/depenses') && !pathname.includes('/new')
  const isAnalyse = pathname.startsWith('/analyse')
  const isEpargne = pathname.startsWith('/epargne')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E5E5] bg-white safe-bottom">
      <div className="mx-auto max-w-[430px] relative flex items-center h-16 px-4">
        <div className="flex-1 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-0.5 min-w-[44px]">
            <Home
              size={23}
              color={isHome ? '#000000' : '#8A8A8A'}
              strokeWidth={isHome ? 2.5 : 1.5}
            />
            {isHome && <span className="text-[9px] font-medium text-black">Accueil</span>}
          </Link>
          <Link href="/depenses" className="flex flex-col items-center gap-0.5 min-w-[44px]">
            <List
              size={23}
              color={isDepenses ? '#000000' : '#8A8A8A'}
              strokeWidth={isDepenses ? 2.5 : 1.5}
            />
            {isDepenses && <span className="text-[9px] font-medium text-black">Dépenses</span>}
          </Link>
        </div>

        <Link
          href="/ajouter"
          className="absolute left-1/2 -translate-x-1/2 -top-5 flex items-center justify-center w-[56px] h-[56px] rounded-full bg-black shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
        >
          <Plus size={26} color="white" strokeWidth={2} />
        </Link>

        <div className="flex-1 flex justify-around items-center">
          <Link href="/analyse" className="flex flex-col items-center gap-0.5 min-w-[44px]">
            <BarChart3
              size={23}
              color={isAnalyse ? '#000000' : '#8A8A8A'}
              strokeWidth={isAnalyse ? 2.5 : 1.5}
            />
            {isAnalyse && <span className="text-[9px] font-medium text-black">Analyse</span>}
          </Link>
          <Link href="/epargne" className="flex flex-col items-center gap-0.5 min-w-[44px]">
            <PiggyBank
              size={23}
              color={isEpargne ? '#000000' : '#8A8A8A'}
              strokeWidth={isEpargne ? 2.5 : 1.5}
            />
            {isEpargne && <span className="text-[9px] font-medium text-black">Épargne</span>}
          </Link>
        </div>
      </div>
    </nav>
  )
}
