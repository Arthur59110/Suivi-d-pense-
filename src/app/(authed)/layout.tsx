import { getSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <>
      <Sidebar userEmail={user.email ?? ''} />
      <main className="pl-56 min-h-full">
        <div className="p-8">{children}</div>
      </main>
    </>
  )
}
