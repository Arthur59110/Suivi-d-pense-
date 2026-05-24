'use client'
import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const POLL_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export default function UpdatePrompt() {
  const currentVersion = useRef<string | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    async function fetchVersion(): Promise<string | null> {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return null
        const data = await res.json()
        return data.version ?? null
      } catch {
        return null
      }
    }

    async function init() {
      const v = await fetchVersion()
      if (v) currentVersion.current = v
    }

    async function poll() {
      const v = await fetchVersion()
      if (v && currentVersion.current && v !== currentVersion.current) {
        setUpdateAvailable(true)
      }
    }

    init()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-[env(safe-area-inset-top)]">
      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full max-w-[430px] h-[52px] rounded-[14px] bg-black text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg active:opacity-80"
      >
        <RefreshCw size={16} color="white" />
        Mise à jour disponible — Actualiser
      </button>
    </div>
  )
}
