export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm'

export default async function AjouterPage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('savings').select('who, account_name').order('account_name')

  const raw = (data ?? []) as { who: 'arthur' | 'paloma'; account_name: string }[]
  const seen = new Set<string>()
  const savingsAccounts = raw.filter(a => {
    const key = `${a.who}::${a.account_name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return <UnifiedTransactionForm savingsAccounts={savingsAccounts} />
}
