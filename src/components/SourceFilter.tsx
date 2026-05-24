'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { REVENUE_SOURCES } from '@/lib/types'
import RevenueIcon from './RevenueIcon'
import { LayoutGrid } from 'lucide-react'

export default function SourceFilter({ activeSrc }: { activeSrc?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setSrc(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete('src')
    else params.set('src', value)
    router.push(`/revenus?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
      <button onClick={() => setSrc(null)} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]">
        <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center transition-colors"
          style={{ background: !activeSrc ? '#000' : '#F7F7F7' }}>
          <LayoutGrid size={18} color={!activeSrc ? '#fff' : '#000'} strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-medium leading-tight" style={{ color: !activeSrc ? '#000' : '#8A8A8A' }}>
          Tous
        </span>
      </button>

      {REVENUE_SOURCES.map(src => {
        const active = activeSrc === src.value
        return (
          <button key={src.value} onClick={() => setSrc(src.value)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]">
            <RevenueIcon source={src.value} size={18} containerSize={44} inverted={active} />
            <span className="text-[10px] font-medium leading-tight text-center"
              style={{ color: active ? '#000' : '#8A8A8A' }}>
              {src.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
