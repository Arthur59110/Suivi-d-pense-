'use client'
import { useEffect, useRef, useState } from 'react'

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function CountUp({
  value,
  duration = 850,
  decimals = 2,
}: {
  value: number
  duration?: number
  decimals?: number
}) {
  const [display, setDisplay] = useState(0)
  const rafId = useRef<number>()
  const startTs = useRef<number | null>(null)
  const target = Math.abs(value)

  useEffect(() => {
    startTs.current = null
    function tick(ts: number) {
      if (startTs.current === null) startTs.current = ts
      const elapsed = ts - startTs.current
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(target * easeOutQuart(progress))
      if (progress < 1) rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [target, duration])

  return (
    <>
      {display.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  )
}
