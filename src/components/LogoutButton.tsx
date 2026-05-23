'use client'
import { useTransition } from 'react'
import { signOut } from '@/lib/actions'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Se déconnecter ?')) return
    startTransition(async () => {
      try {
        await signOut()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold flex items-center justify-center gap-2 disabled:bg-[#C8C8C8]"
    >
      <LogOut size={18} color="white" />
      {isPending ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}
