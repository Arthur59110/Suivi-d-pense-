'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { setUserInfo, markSessionUnlocked, canUseBiometric, isBiometricEnrolled, registerBiometric } from '@/lib/biometric'
import { getUserName } from '@/lib/types'
import { ScanFace } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showFaceIdPrompt, setShowFaceIdPrompt] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [userId, setUserId] = useState('')
  const router = useRouter()

  function goToApp() {
    router.push('/')
    router.refresh()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = getSupabaseBrowser()
      const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); return }
      const name = getUserName(email)
      setUserInfo(email, name)
      markSessionUnlocked()
      // Propose Face ID si dispo et pas encore activé
      const available = await canUseBiometric()
      if (available && !isBiometricEnrolled()) {
        setUserId(data.user?.id ?? '')
        setShowFaceIdPrompt(true)
        return
      }
      goToApp()
    })
  }

  async function handleEnrollFaceId() {
    setEnrolling(true)
    const name = getUserName(email)
    const ok = await registerBiometric(userId, name)
    setEnrolling(false)
    if (!ok) {
      // annulé ou échec → on passe quand même
    }
    goToApp()
  }

  if (showFaceIdPrompt) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-16 h-16 rounded-[18px] bg-black flex items-center justify-center">
          <ScanFace size={32} color="white" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h2 className="text-[22px] font-bold text-black">Activer Face ID</h2>
          <p className="text-[14px] text-[#8A8A8A] mt-2 leading-snug">
            Déverrouillez l&apos;application d&apos;un coup d&apos;œil,<br />sans saisir votre mot de passe.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleEnrollFaceId}
            disabled={enrolling}
            className="h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-50"
          >
            {enrolling ? 'En attente de Face ID…' : 'Activer Face ID'}
          </button>
          <button
            onClick={goToApp}
            className="h-[48px] text-[15px] font-medium text-[#8A8A8A]"
          >
            Pas maintenant
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-[13px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Email</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="mt-2 w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
      </div>
      <div>
        <label className="text-[13px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Mot de passe</label>
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
          className="mt-2 w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
      </div>
      {error && <p className="text-[13px] text-red-500 bg-red-50 rounded-[10px] px-3 py-2">{error}</p>}
      <button type="submit" disabled={isPending}
        className="mt-2 h-[56px] rounded-[12px] bg-black text-white text-[16px] font-semibold disabled:opacity-50">
        {isPending ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
