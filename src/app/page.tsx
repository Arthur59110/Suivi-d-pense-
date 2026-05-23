export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import type { Expense } from '@/lib/types'
import StatsCards from '@/components/StatsCards'
import ExpenseChart from '@/components/ExpenseChart'
import { CATEGORIES } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  const allExpenses: Expense[] = (data as Expense[] | null) ?? []

  const now = new Date()
  const monthExpenses = allExpenses.filter((e) => {
    const d = new Date(e.date)
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })

  const recent = allExpenses.slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Tableau de bord
      </h1>

      <StatsCards expenses={allExpenses} />

      <div className="grid grid-cols-2 gap-6">
        <ExpenseChart expenses={monthExpenses} />

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-700">
              Dernières dépenses
            </h2>
            <Link
              href="/depenses"
              className="text-xs text-blue-600 hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-400 text-sm">
                Aucune dépense enregistrée.
              </p>
              <Link
                href="/depenses/new"
                className="text-blue-600 text-sm hover:underline mt-2 inline-block"
              >
                Ajouter votre première dépense
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((expense) => {
                const cat = CATEGORIES.find(
                  (c) => c.value === expense.category
                )
                return (
                  <li
                    key={expense.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cat?.color ?? '#94a3b8' }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-800 truncate">
                          {expense.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(expense.date), 'd MMM yyyy', {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 ml-4 flex-shrink-0">
                      {expense.amount.toFixed(2)} €
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
