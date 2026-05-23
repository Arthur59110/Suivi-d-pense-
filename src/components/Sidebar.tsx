'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/depenses', label: 'Dépenses' },
  { href: '/depenses/new', label: 'Nouvelle dépense' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-800 flex flex-col z-10">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-white font-semibold text-base leading-tight">
          Suivi Dépenses
        </h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
