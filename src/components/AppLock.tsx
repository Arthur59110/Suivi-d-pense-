'use client'
import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import {
  isBiometricEnrolled, isSessionUnlocked, markSessionUnlocked,
  verifyBiometric, getBiometricEmail, getBiometricName,
  recordHiddenAt, shouldRelockAfterBackground, lockSession,
} from '@/lib/biometric'

type Screen = 'unlocked' | 'face-id' | 'password' | 'verifying'

export default function AppLock({ children }: { children: React.ReactNode }) {
  // Default unlocked pour que SSR et hydration soient identiques (pas de mismatch)
  const [screen, setScreen] = useState<Screen>('unlocked')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState('')

  const unlock = useCallback(() => {
    markSessionUnlocked()
    setScreen('unlocked')
    setError(null)
    setPassword('')
  }, [])

  // useLayoutEffect : s'exécute avant le premier paint → pas de flash de contenu
  useLayoutEffect(() => {
    setName(getBiometricName())
    try {
      if (isBiometricEnrolled() && !isSessionUnlocked()) {
        setScreen('face-id')
      } else {
        markSessionUnlocked()
      }
    } catch {
      // localStorage inaccessible (mode privé strict) → on laisse passer
      markSessionUnlocked()
    }
  }, [])

  // Re-verrouillage en arrière-plan
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        recordHiddenAt()
      } else if (shouldRelockAfterBackground() && isBiometricEnrolled()) {
        lockSession()
        setScreen('face-id')
        setError(null)
        setPassword('')
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  async function handleFaceId() {
    setError(null)
    setScreen('verifying')
    const ok = await verifyBiometric()
    if (ok) { unlock(); return }
    setError('Face ID non reconnu')
    setScreen('face-id')
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setIsPending(true)
    setError(null)
    try {
      const email = getBiometricEmail()
      const supabase = getSupabaseBrowser()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Mot de passe incorrect'); return }
      unlock()
    } finally {
      setIsPending(false)
    }
  }

  if (screen === 'unlocked') return <>{children}</>

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white safe-top" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-0">
        {/* Icône app */}
        <div className="w-16 h-16 rounded-[18px] bg-black flex items-center justify-center mb-8">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16h4m4 0h4M16 8v4m0 4v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        <p className="text-[13px] text-[#8A8A8A] mb-1">Suivi</p>
        <h1 className="text-[28px] font-bold text-black mb-8">
          {name ? `Bonjour, ${name}` : 'Bonjour'}
        </h1>

        {(screen === 'face-id' || screen === 'verifying') && (
          <div className="flex flex-col items-center gap-5 w-full">
            <button
              onClick={handleFaceId}
              disabled={screen === 'verifying'}
              className="flex flex-col items-center gap-3 group disabled:opacity-50"
            >
              <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center transition-transform group-active:scale-95">
                <FaceIdIcon size={44} spinning={screen === 'verifying'} />
              </div>
              <span className="text-[15px] font-semibold text-black">
                {screen === 'verifying' ? 'Vérification…' : 'Déverrouiller avec Face ID'}
              </span>
            </button>

            {error && <p className="text-[13px] text-red-500">{error}</p>}

            <button
              onClick={() => { setScreen('password'); setError(null) }}
              className="mt-4 text-[14px] text-[#8A8A8A] font-medium"
            >
              Utiliser le mot de passe
            </button>
          </div>
        )}

        {screen === 'password' && (
          <form onSubmit={handlePassword} className="flex flex-col gap-3 w-full">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
                Mot de passe
              </label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-2 w-full rounded-[14px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-[13px] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isPending || !password}
              className="h-[54px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40 mt-1"
            >
              {isPending ? 'Vérification…' : 'Déverrouiller'}
            </button>
            <button
              type="button"
              onClick={() => { setScreen('face-id'); setError(null) }}
              className="text-[14px] text-[#8A8A8A] font-medium py-1"
            >
              Retour à Face ID
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function FaceIdIcon({ size, spinning }: { size: number; spinning: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={spinning ? 'animate-spin' : ''}
      style={spinning ? { animationDuration: '1.2s' } : undefined}
    >
      {/* Coins du cadre */}
      <path d="M6 14V8a2 2 0 0 1 2-2h6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 14V8a2 2 0 0 0-2-2h-6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6 30v6a2 2 0 0 0 2 2h6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 30v6a2 2 0 0 1-2 2h-6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Yeux */}
      <circle cx="16" cy="19" r="1.5" fill="#000"/>
      <circle cx="28" cy="19" r="1.5" fill="#000"/>
      {/* Nez */}
      <path d="M22 19v3.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      {/* Bouche */}
      <path d="M17 27c1.2 2 7.8 2 9 0" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
