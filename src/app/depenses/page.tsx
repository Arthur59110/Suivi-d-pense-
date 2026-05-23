export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import type { Expense } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'

export default async function DepensesPage() {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  const expenses: Expense[] = (data as Expense[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dépenses</h1>
        <Link
          href="/depenses/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Nouvelle dépense
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">Aucune dépense enregistrée.</p>
            <Link
              href="/depenses/new"
              className="text-blue-600 text-sm hover:underline mt-2 inline-block"
            >
              Ajouter votre première dépense
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                  Description
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                  Catégorie
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                  Montant
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => {
                const cat = CATEGORIES.find(
                  (c) => c.value === expense.category
                )
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {format(new Date(expense.date), 'd MMM yyyy', {
                        locale: fr,
                      })}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-800">
                      {expense.description}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: `${cat?.color ?? '#94a3b8'}20`,
                          color: cat?.color ?? '#64748b',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: cat?.color ?? '#64748b' }}
                        />
                        {cat?.label ?? expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 text-right">
                      {expense.amount.toFixed(2)} €
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/depenses/${expense.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                        >
                          Modifier
                        </Link>
                        <DeleteButton id={expense.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
