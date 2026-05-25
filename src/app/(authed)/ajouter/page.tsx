export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import UnifiedTransactionForm from '@/components/UnifiedTransactionForm'

export default async function AjouterPage() {
  const supabase = await getSupabaseServer()
  const now = new Date()
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd')

  let savingsAccounts: { who: 'arthur' | 'paloma'; account_name: string }[] = []
  let monthBalance = { arthur: 0, paloma: 0 }

  try {
    const [savingsRes, expensesRes, revenuesRes] = await Promise.all([
      supabase.from('savings').select('who, account_name').order('account_name'),
      supabase.from('expenses').select('who, amount').gte('date', startDate).lte('date', endDate),
      supabase.from('revenues').select('who, amount').gte('budget_month', startDate).lte('budget_month', endDate),
    ])

    if (savingsRes.data) {
      const seen = new Set<string>()
      savingsAccounts = (savingsRes.data as typeof savingsAccounts).filter(a => {
        const key = `${a.who}::${a.account_name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    const expenses = (expensesRes.data ?? []) as { who: string; amount: number }[]
    const revenues = (revenuesRes.data ?? []) as { who: string; amount: number }[]

    for (const person of ['arthur', 'paloma'] as const) {
      const rev = revenues.filter(r => r.who === person).reduce((s, r) => s + r.amount, 0)
      const exp = expenses.filter(e => e.who === person).reduce((s, e) => s + e.amount, 0)
      monthBalance[person] = rev - exp
    }
  } catch {
    // erreur réseau → formulaire sans vérification de solde
  }

  return <UnifiedTransactionForm savingsAccounts={savingsAccounts} monthBalance={monthBalance} />
}
