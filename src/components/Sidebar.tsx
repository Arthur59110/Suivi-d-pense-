'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { signOut } from '@/lib/actions'

const nav = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/depenses', label: 'Dépenses' },
  { href: '/depenses/new', label: 'Nouvelle dépense' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

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

      <div className="px-3 py-3 border-t border-slate-700 space-y-2">
        <p className="text-xs text-slate-500 px-3 truncate" title={userEmail}>
          {userEmail}
        </p>
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={isPending}
          className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </aside>
  )
}
