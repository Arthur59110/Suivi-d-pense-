'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'

interface Props {
  activeWho?: string
  activeCat?: string
}

export default function FilterChips({ activeWho, activeCat }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === 'all') {
      params.delete('who')
      params.delete('cat')
    } else if (key === 'who') {
      params.set('who', value)
      params.delete('cat')
    } else {
      params.set('cat', value)
      params.delete('who')
    }
    router.push(`/depenses?${params.toString()}`)
  }

  const chips = [
    { label: 'Tout', active: !activeWho && !activeCat, onClick: () => setFilter('who', 'all') },
    { label: 'Arthur', active: activeWho === 'arthur', onClick: () => setFilter('who', 'arthur') },
    { label: 'Paloma', active: activeWho === 'paloma', onClick: () => setFilter('who', 'paloma') },
    ...CATEGORIES.map(c => ({
      label: c.label,
      active: activeCat === c.value,
      onClick: () => setFilter('cat', c.value),
    })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {chips.map(chip => (
        <button
          key={chip.label}
          onClick={chip.onClick}
          className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors"
          style={{
            background: chip.active ? '#000000' : '#F7F7F7',
            color: chip.active ? '#ffffff' : '#8A8A8A',
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
