export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import { getUserName, getWhoFromEmail } from '@/lib/types'
import { AvatarArthur, AvatarPaloma } from '@/components/Avatars'
import LogoutButton from '@/components/LogoutButton'
import NotificationToggle from '@/components/NotificationToggle'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Settings2, PiggyBank, BarChart3, Mail } from 'lucide-react'

export default async function ProfilPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const firstName = getUserName(email)
  const isArthur = firstName === 'Arthur'
  const who = getWhoFromEmail(email)

  return (
    <div className="flex flex-col px-5 pt-4 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Profil</h1>
      </div>

      {/* Carte identité */}
      <div className="rounded-[20px] bg-[#F7F7F7] p-6 flex flex-col items-center text-center">
        <div className="mb-3">
          {isArthur ? <AvatarArthur size={92} /> : <AvatarPaloma size={92} />}
        </div>
        <p className="text-[22px] font-bold text-black">{firstName}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Mail size={13} color="#8A8A8A" />
          <p className="text-[13px] text-[#8A8A8A]">{email}</p>
        </div>
      </div>

      {/* Raccourcis */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
          Raccourcis
        </p>
        <div className="rounded-[16px] bg-[#F7F7F7] overflow-hidden">
          <Link href="/budgets" className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAEAEA]">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
              <Settings2 size={18} color="#000" strokeWidth={1.5} />
            </div>
            <span className="flex-1 text-[15px] font-medium text-black">Gérer mes budgets</span>
            <ChevronRight size={16} color="#8A8A8A" />
          </Link>
          <Link href="/epargne" className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAEAEA]">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
              <PiggyBank size={18} color="#000" strokeWidth={1.5} />
            </div>
            <span className="flex-1 text-[15px] font-medium text-black">Mon épargne</span>
            <ChevronRight size={16} color="#8A8A8A" />
          </Link>
          <Link href="/analyse" className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
              <BarChart3 size={18} color="#000" strokeWidth={1.5} />
            </div>
            <span className="flex-1 text-[15px] font-medium text-black">Analyse budget</span>
            <ChevronRight size={16} color="#8A8A8A" />
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
          Notifications
        </p>
        <NotificationToggle who={who} />
      </div>

      {/* Déconnexion */}
      <div className="mt-2">
        <LogoutButton />
        <p className="text-[12px] text-[#8A8A8A] text-center mt-3">
          Suivi de dépenses · Arthur &amp; Paloma
        </p>
      </div>
    </div>
  )
}
