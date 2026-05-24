'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBar({
  percent,
  color = '#000',
  bgColor = '#E5E5E5',
  height = 6,
  delay = 0,
}: {
  percent: number
  color?: string
  bgColor?: string
  height?: number
  delay?: number
}) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.width = '0%'
    const t = setTimeout(() => {
      if (!el) return
      el.style.transition = `width 0.9s cubic-bezier(0.25, 1, 0.5, 1)`
      el.style.width = `${Math.min(Math.max(percent, 0), 100)}%`
    }, delay + 80)
    return () => clearTimeout(t)
  }, [percent, delay])

  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: bgColor }}
    >
      <div
        ref={barRef}
        style={{ height: '100%', background: color, borderRadius: 9999, width: '0%' }}
      />
    </div>
  )
}
