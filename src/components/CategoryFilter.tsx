'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'
import CategoryIcon from './CategoryIcon'
import { LayoutGrid } from 'lucide-react'

interface Props {
  activeCat?: string
}

export default function CategoryFilter({ activeCat }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setCat(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete('cat')
    else params.set('cat', value)
    router.push(`/depenses?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => setCat(null)}
        className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]"
      >
        <div
          className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center transition-colors"
          style={{ background: !activeCat ? '#000000' : '#F7F7F7' }}
        >
          <LayoutGrid size={18} color={!activeCat ? '#ffffff' : '#000000'} strokeWidth={1.5} />
        </div>
        <span
          className="text-[10px] font-medium leading-tight"
          style={{ color: !activeCat ? '#000000' : '#8A8A8A' }}
        >
          Toutes
        </span>
      </button>

      {CATEGORIES.map(cat => {
        const active = activeCat === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setCat(cat.value)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]"
          >
            <CategoryIcon
              category={cat.value}
              size={18}
              containerSize={44}
              inverted={active}
            />
            <span
              className="text-[10px] font-medium leading-tight text-center"
              style={{ color: active ? '#000000' : '#8A8A8A' }}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
