'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Plus, BarChart3, PiggyBank } from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}

function NavLink({ href, icon: Icon, label, active }: NavItem) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 min-w-[44px] transition-transform duration-100 active:scale-[0.85]"
    >
      <Icon
        size={23}
        color={active ? '#000000' : '#8A8A8A'}
        strokeWidth={active ? 2.5 : 1.5}
        style={{ transition: 'color 0.2s ease, stroke-width 0.2s ease' }}
      />
      <div
        className="rounded-full"
        style={{
          height: 3,
          width: active ? 18 : 0,
          background: '#000',
          transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {active && (
        <span className="text-[9px] font-semibold text-black animate-fade-in" style={{ marginTop: -2 }}>
          {label}
        </span>
      )}
    </Link>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const isHome      = pathname === '/'
  const isDepenses  = pathname.startsWith('/depenses') && !pathname.includes('/new')
  const isAnalyse   = pathname.startsWith('/analyse')
  const isEpargne   = pathname.startsWith('/epargne')
  const isNotesFrais = pathname === '/notes-frais'

  const addHref = isNotesFrais ? '/notes-frais/nouveau' : '/ajouter'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E5E5] bg-white safe-bottom">
      <div className="mx-auto max-w-[430px] relative flex items-center h-16 px-4">
        <div className="flex-1 flex justify-around items-center">
          <NavLink href="/"         icon={Home}      label="Accueil"  active={isHome} />
          <NavLink href="/depenses" icon={List}       label="Dépenses" active={isDepenses} />
        </div>

        <Link
          href={addHref}
          className="absolute left-1/2 -translate-x-1/2 -top-5 flex items-center justify-center w-[56px] h-[56px] rounded-full bg-black transition-transform duration-100 active:scale-90"
          style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.30)' }}
        >
          <Plus size={26} color="white" strokeWidth={2} />
        </Link>

        <div className="flex-1 flex justify-around items-center">
          <NavLink href="/analyse" icon={BarChart3}  label="Analyse"  active={isAnalyse} />
          <NavLink href="/epargne" icon={PiggyBank}  label="Épargne"  active={isEpargne} />
        </div>
      </div>
    </nav>
  )
}
