'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/client'
import { setUserInfo, markSessionUnlocked } from '@/lib/biometric'
import { getUserName } from '@/lib/types'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = getSupabaseBrowser()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); return }
      setUserInfo(email, getUserName(email))
      markSessionUnlocked()
      router.push('/')
      router.refresh()
    })
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
