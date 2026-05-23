export const dynamic = 'force-dynamic'

import { getSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[430px] min-h-screen flex flex-col pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
