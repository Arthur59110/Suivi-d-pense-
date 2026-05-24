export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm'

export default async function AjouterPage() {
  let savingsAccounts: { who: 'arthur' | 'paloma'; account_name: string }[] = []

  try {
    const supabase = await getSupabaseServer()
    const { data } = await supabase.from('savings').select('who, account_name').order('account_name')
    if (data) {
      const seen = new Set<string>()
      savingsAccounts = (data as typeof savingsAccounts).filter(a => {
        const key = `${a.who}::${a.account_name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
  } catch {
    // colonne manquante ou erreur réseau → formulaire sans autocomplétion épargne
  }

  return <UnifiedTransactionForm savingsAccounts={savingsAccounts} />
}
