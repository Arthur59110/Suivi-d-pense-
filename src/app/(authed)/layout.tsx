export const dynamic = 'force-dynamic'

import { getSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import PullToRefresh from '@/components/PullToRefresh'
import UpdatePrompt from '@/components/UpdatePrompt'
import DailyMessage from '@/components/DailyMessage'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import AppLock from '@/components/AppLock'

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-white safe-top">
      <ServiceWorkerRegister />
      <DailyMessage />
      <UpdatePrompt />
      <AppLock>
        <PullToRefresh>
          <div className="mx-auto max-w-[430px] min-h-screen flex flex-col pb-[calc(5rem+env(safe-area-inset-bottom))]">
            {children}
          </div>
        </PullToRefresh>
        <BottomNav />
      </AppLock>
    </div>
  )
}
