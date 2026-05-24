export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import NewSavingForm from '@/components/NewSavingForm'
import { Suspense } from 'react'

export default async function NewSavingPage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('savings')
    .select('who, account_name')
    .order('account_name')

  const raw = (data ?? []) as { who: 'arthur' | 'paloma'; account_name: string }[]
  const seen = new Set<string>()
  const existingAccounts = raw.filter(a => {
    const key = `${a.who}::${a.account_name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return <Suspense><NewSavingForm existingAccounts={existingAccounts} /></Suspense>
}
