'use client'
import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import {
  isLockEnabled, isBiometricEnrolled, isPinEnrolled,
  isSessionUnlocked, markSessionUnlocked,
  verifyBiometric, verifyPin,
  getBiometricName, getBiometricEmail,
  recordHiddenAt, shouldRelockAfterBackground, lockSession,
} from '@/lib/biometric'
import { Delete } from 'lucide-react'

type Screen = 'unlocked' | 'face-id' | 'verifying' | 'pin' | 'password'

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function AppLock({ children }: { children: React.ReactNode }) {
  const [screen, setScreen]   = useState<Screen>('unlocked')
  const [pin, setPin]         = useState('')
  const [shake, setShake]     = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [name, setName]       = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [pwPending, setPwPending] = useState(false)

  const unlock = useCallback(() => {
    markSessionUnlocked()
    setScreen('unlocked')
    setError(null)
    setPin('')
  }, [])

  const showPin = useCallback(() => {
    setScreen('pin')
    setPin('')
    setError(null)
  }, [])

  // Pré-remplit l'email quand on bascule sur l'écran mot de passe
  const showPassword = useCallback(() => {
    setScreen('password')
    setError(null)
    setPassword('')
    setEmail(getBiometricEmail())
  }, [])

  // Détermine l'écran initial avant le premier paint
  useLayoutEffect(() => {
    setName(getBiometricName())
    try {
      if (isLockEnabled() && !isSessionUnlocked()) {
        setScreen(isBiometricEnrolled() ? 'face-id' : 'pin')
      } else {
        markSessionUnlocked()
      }
    } catch {
      markSessionUnlocked()
    }
  }, [])

  // Déclenche Face ID automatiquement au montage si biométrie active
  useEffect(() => {
    if (screen !== 'face-id') return
    const t = setTimeout(async () => {
      setScreen('verifying')
      const ok = await verifyBiometric()
      if (ok) { unlock(); return }
      // Face ID échoue → bascule vers PIN si disponible, sinon réessai
      if (isPinEnrolled()) { showPin(); return }
      setScreen('face-id')
    }, 200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // volontairement au montage uniquement

  // Verrouillage immédiat dès que l'app passe en arrière-plan
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        if (isLockEnabled()) lockSession()
      } else {
        if (isLockEnabled() && !isSessionUnlocked()) {
          setScreen(isBiometricEnrolled() ? 'face-id' : 'pin')
          setPin('')
          setError(null)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Vérification automatique quand 6 chiffres saisis
  useEffect(() => {
    if (pin.length !== 6) return
    verifyPin(pin).then(ok => {
      if (ok) { unlock(); return }
      setShake(true)
      setError('Code incorrect')
      setTimeout(() => { setShake(false); setPin('') }, 600)
    })
  }, [pin, unlock])

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setPwPending(true); setError(null)
    try {
      const { getSupabaseBrowser } = await import('@/lib/supabase/client')
      const supabase = getSupabaseBrowser()
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (err) { setError('Email ou mot de passe incorrect'); return }
      unlock()
    } finally { setPwPending(false) }
  }

  async function handleFaceId() {
    setError(null)
    setScreen('verifying')
    const ok = await verifyBiometric()
    if (ok) { unlock(); return }
    if (isPinEnrolled()) { showPin(); return }
    setError('Face ID non reconnu')
    setScreen('face-id')
  }

  function pressKey(key: string) {
    if (shake) return
    if (key === '⌫') { setPin(p => p.slice(0, -1)); setError(null); return }
    if (key === '')   return
    if (pin.length >= 6) return
    setPin(p => p + key)
  }

  if (screen === 'unlocked') return <>{children}</>

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Haut */}
      <div className="flex flex-col items-center pt-16 pb-8 px-8">
        <div className="w-14 h-14 rounded-[16px] bg-black flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M8 16h4m4 0h4M16 8v4m0 4v4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <p className="text-[13px] text-[#8A8A8A]">Suivi</p>
        <h1 className="text-[26px] font-bold text-black mt-1">
          {name ? `Bonjour, ${name}` : 'Bonjour'}
        </h1>
      </div>

      {/* Face ID */}
      {(screen === 'face-id' || screen === 'verifying') && (
        <div className="flex-1 flex flex-col items-center justify-between pb-10 px-8">
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <button
              onClick={handleFaceId}
              disabled={screen === 'verifying'}
              className="flex flex-col items-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
            >
              <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center">
                <FaceIdIcon size={44} spinning={screen === 'verifying'} />
              </div>
              <span className="text-[15px] font-semibold text-black">
                {screen === 'verifying' ? 'Vérification…' : 'Déverrouiller avec Face ID'}
              </span>
            </button>
            {error && <p className="text-[13px] text-red-500">{error}</p>}
          </div>
          {/* Fallback */}
          {isPinEnrolled() && (
            <button onClick={showPin} className="text-[15px] font-semibold text-black py-2">
              Utiliser le code
            </button>
          )}
        </div>
      )}

      {/* Mot de passe */}
      {screen === 'password' && (
        <div className="flex-1 flex flex-col justify-between px-8 pb-10">
          <form onSubmit={handlePassword} className="flex-1 flex flex-col justify-center gap-3">
            <p className="text-[16px] font-semibold text-black text-center mb-2">Mot de passe</p>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-[14px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
              placeholder="adresse@email.com"
            />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-[14px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
              placeholder="••••••••"
            />
            {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={pwPending || !password}
              className="h-[54px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40"
            >
              {pwPending ? 'Vérification…' : 'Déverrouiller'}
            </button>
          </form>
          <div className="flex flex-col items-center gap-2">
            {isBiometricEnrolled() && (
              <button onClick={() => { setScreen('face-id'); setError(null) }} className="text-[14px] font-medium text-[#8A8A8A] py-1">
                Retour à Face ID
              </button>
            )}
            {isPinEnrolled() && (
              <button onClick={showPin} className="text-[14px] font-medium text-[#8A8A8A] py-1">
                Utiliser le code
              </button>
            )}
          </div>
        </div>
      )}

      {/* PIN pad */}
      {screen === 'pin' && (
        <div className="flex-1 flex flex-col items-center justify-between px-8 pb-6">
          <div className="flex flex-col items-center gap-6 mt-4">
            <p className="text-[16px] font-semibold text-black">Entrez votre code</p>

            {/* 6 points */}
            <div className={`flex gap-4 ${shake ? 'animate-pin-shake' : ''}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-black transition-all duration-100"
                  style={{ background: i < pin.length ? '#000' : 'transparent' }}
                />
              ))}
            </div>

            {error && <p className="text-[13px] text-red-500 animate-fade-in">{error}</p>}
          </div>

          {/* Clavier numérique */}
          <div className="w-full max-w-[300px]">
            <div className="grid grid-cols-3 gap-3">
              {PAD.map((key, i) => {
                if (key === '') {
                  // Case vide — bouton Face ID si dispo
                  return isBiometricEnrolled() ? (
                    <button
                      key={i}
                      onClick={() => { setScreen('face-id'); setPin(''); setError(null) }}
                      className="h-[72px] flex items-center justify-center rounded-[18px] bg-[#F2F2F7] active:bg-[#E5E5EA] transition-colors"
                    >
                      <FaceIdIcon size={28} spinning={false} />
                    </button>
                  ) : <div key={i} />
                }
                if (key === '⌫') {
                  return (
                    <button
                      key={i}
                      onClick={() => pressKey('⌫')}
                      className="h-[72px] flex items-center justify-center rounded-[18px] bg-[#F2F2F7] active:bg-[#E5E5EA] transition-colors"
                    >
                      <Delete size={22} color="#000" />
                    </button>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={() => pressKey(key)}
                    className="h-[72px] flex flex-col items-center justify-center rounded-[18px] bg-[#F2F2F7] active:bg-[#E5E5EA] transition-colors"
                  >
                    <span className="text-[28px] font-light text-black leading-none">{key}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Retour Face ID depuis le PIN */}
          {isBiometricEnrolled() && (
            <button onClick={() => { setScreen('face-id'); setPin(''); setError(null) }}
              className="text-[14px] font-medium text-[#8A8A8A] py-2 mt-2">
              Face ID
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FaceIdIcon({ size, spinning }: { size: number; spinning: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none"
      className={spinning ? 'animate-spin' : ''} style={spinning ? { animationDuration: '1.2s' } : undefined}>
      <path d="M6 14V8a2 2 0 0 1 2-2h6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 14V8a2 2 0 0 0-2-2h-6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6 30v6a2 2 0 0 0 2 2h6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M38 30v6a2 2 0 0 1-2 2h-6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="16" cy="19" r="1.5" fill="#000"/>
      <circle cx="28" cy="19" r="1.5" fill="#000"/>
      <path d="M22 19v3.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 27c1.2 2 7.8 2 9 0" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
