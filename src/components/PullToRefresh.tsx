'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 64
const MAX_PULL = 96

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const active = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 2 || refreshing) return
    startY.current = e.touches[0].clientY
    active.current = true
  }, [refreshing])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!active.current || refreshing) return
    const delta = e.touches[0].clientY - startY.current
    if (delta <= 0) { active.current = false; return }
    setPull(Math.min(delta * 0.42, MAX_PULL))
  }, [refreshing])

  const onTouchEnd = useCallback(async () => {
    if (!active.current) return
    active.current = false
    if (pull >= THRESHOLD) {
      setRefreshing(true)
      setPull(56)
      router.refresh()
      await new Promise(r => setTimeout(r, 600))
      setRefreshing(false)
      setPull(0)
    } else {
      setPull(0)
    }
  }, [pull, router])

  const progress = Math.min(pull / THRESHOLD, 1)
  const iconRotation = refreshing ? undefined : `rotate(${progress * 300}deg)`
  const indicatorY = Math.max(pull - 52, -20)
  const settling = pull === 0 || refreshing

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Indicateur de chargement */}
      <div
        className="absolute left-1/2 z-50 flex items-center justify-center"
        style={{
          top: 8,
          transform: `translateX(-50%) translateY(${indicatorY}px)`,
          opacity: Math.min(progress * 1.4, 1),
          transition: settling ? 'transform 0.3s ease, opacity 0.3s ease' : 'none',
          pointerEvents: 'none',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] flex items-center justify-center">
          <RefreshCw
            size={18}
            color="#000"
            className={refreshing ? 'animate-spin' : ''}
            style={refreshing ? undefined : { transform: iconRotation }}
          />
        </div>
      </div>

      {/* Contenu déplacé vers le bas pendant le pull */}
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: settling ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
