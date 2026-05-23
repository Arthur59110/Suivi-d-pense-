'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Plus } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isDepenses = pathname.startsWith('/depenses') && !pathname.includes('/new')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E5E5] bg-white">
      <div className="mx-auto max-w-[430px] flex items-center justify-around h-16 px-6">
        <Link href="/" className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <Home size={24} color={isHome ? '#000000' : '#8A8A8A'} strokeWidth={isHome ? 2.5 : 1.5} />
          {isHome && <span className="text-[10px] font-medium text-black">Accueil</span>}
        </Link>

        <Link href="/ajouter" className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-black -mt-4 shadow-lg">
          <Plus size={24} color="white" strokeWidth={2} />
        </Link>

        <Link href="/depenses" className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <List size={24} color={isDepenses ? '#000000' : '#8A8A8A'} strokeWidth={isDepenses ? 2.5 : 1.5} />
          {isDepenses && <span className="text-[10px] font-medium text-black">Dépenses</span>}
        </Link>
      </div>
    </nav>
  )
}
