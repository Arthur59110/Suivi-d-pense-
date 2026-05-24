'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const OPTIONS = [
  { label: 'Dépenses', href: '/depenses' },
  { label: 'Revenus', href: '/revenus' },
]

export default function PageSwitcher({ current }: { current: 'depenses' | 'revenus' }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLabel = current === 'depenses' ? 'Dépenses' : 'Revenus'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5"
      >
        <span className="text-[28px] font-bold text-black leading-none">{currentLabel}</span>
        <ChevronDown
          size={22}
          color="#000"
          strokeWidth={2.5}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 rounded-[16px] bg-white overflow-hidden z-50"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 160 }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.href}
              type="button"
              onClick={() => { setOpen(false); router.push(opt.href) }}
              className="w-full text-left px-5 py-4 text-[16px] font-semibold transition-colors"
              style={{
                color: opt.label === currentLabel ? '#000' : '#8A8A8A',
                background: opt.label === currentLabel ? '#F7F7F7' : '#fff',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
