'use client'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  activeWho?: string
  basePath?: string
}

export default function PersonFilter({ activeWho, basePath = '/depenses' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setWho(value: 'all' | 'arthur' | 'paloma') {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete('who')
    else params.set('who', value)
    router.push(`${basePath}?${params.toString()}`)
  }

  const current = activeWho === 'arthur' || activeWho === 'paloma' ? activeWho : 'all'

  return (
    <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
      {([
        { value: 'all', label: 'Tout' },
        { value: 'arthur', label: 'Arthur' },
        { value: 'paloma', label: 'Paloma' },
      ] as const).map(item => (
        <button
          key={item.value}
          onClick={() => setWho(item.value)}
          className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all"
          style={{
            background: current === item.value ? '#ffffff' : 'transparent',
            color: current === item.value ? '#000000' : '#8A8A8A',
            boxShadow: current === item.value ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
