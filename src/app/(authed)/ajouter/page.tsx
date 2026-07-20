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
  const monthBalance = { arthur: 0, paloma: 0 }

  try {
    const [savingsRes, expensesRes, revenuesRes, savingsMovementsRes, notesRes] = await Promise.all([
      supabase.from('savings').select('who, account_name').order('account_name'),
      supabase.from('expenses').select('who, amount').neq('category', 'epargne').gte('date', startDate).lte('date', endDate),
      supabase.from('revenues').select('who, amount').gte('budget_month', startDate).lte('budget_month', endDate),
      supabase.from('savings').select('who, amount, type').gte('date', startDate).lte('date', endDate),
      // Notes de frais du mois (comme l'accueil) : avances déduites, remboursements crédités
      supabase.from('expense_notes').select('who, amount, type, reimbursed').gte('date', startDate).lte('date', endDate),
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
    const savingsMovements = (savingsMovementsRes.data ?? []) as { who: string; amount: number; type: string }[]
    // Graceful degradation si la table n'existe pas encore
    const notes = (notesRes.error ? [] : (notesRes.data ?? [])) as { who: string; amount: number; type: string; reimbursed: boolean }[]
    const notesAdvances = notes.filter(n => n.type === 'advance')
    const notesDirectReimb = notes.filter(n => n.type === 'reimbursement')
    const notesAdvReimb = notesAdvances.filter(n => n.reimbursed)

    for (const person of ['arthur', 'paloma'] as const) {
      const rev = revenues.filter(r => r.who === person).reduce((s, r) => s + r.amount, 0)
      const exp = expenses.filter(e => e.who === person).reduce((s, e) => s + e.amount, 0)
      const netSav = savingsMovements.filter(sv => sv.who === person && sv.type === 'deposit').reduce((s, sv) => s + sv.amount, 0)
        - savingsMovements.filter(sv => sv.who === person && sv.type === 'withdrawal').reduce((s, sv) => s + sv.amount, 0)
      // Même notesImpact que l'accueil : avance déduite, remboursement (avance pointée
      // ou remboursement direct) crédité. Peut être négatif = crédit sur le solde.
      const notesImpact = notesAdvances.filter(n => n.who === person).reduce((s, n) => s + n.amount, 0)
        - notesAdvReimb.filter(n => n.who === person).reduce((s, n) => s + n.amount, 0)
        - notesDirectReimb.filter(n => n.who === person).reduce((s, n) => s + n.amount, 0)
      monthBalance[person] = rev - exp - netSav - notesImpact
    }
  } catch {
    // erreur réseau → formulaire sans vérification de solde
  }

  return <UnifiedTransactionForm savingsAccounts={savingsAccounts} monthBalance={monthBalance} />
}
