'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AnalyseTabs({ view }: { view: 'mois' | 'annee' }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function switchTo(newView: 'mois' | 'annee') {
    const params = new URLSearchParams(searchParams)
    params.set('view', newView)
    params.delete('period')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
      {(['mois', 'annee'] as const).map(v => (
        <button
          key={v}
          type="button"
          onClick={() => switchTo(v)}
          className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all"
          style={{
            background: view === v ? '#ffffff' : 'transparent',
            color: view === v ? '#000000' : '#8A8A8A',
            boxShadow: view === v ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {v === 'mois' ? 'Mois' : 'Année'}
        </button>
      ))}
    </div>
  )
}
