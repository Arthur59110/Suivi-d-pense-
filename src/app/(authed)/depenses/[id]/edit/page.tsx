import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense } from '@/lib/types'
import ExpenseForm from '@/components/ExpenseForm'
import { notFound } from 'next/navigation'

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  const expense = data as Expense | null

  if (!expense) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Modifier la dépense
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ExpenseForm
          expenseId={expense.id}
          defaultValues={{
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expense.date,
          }}
        />
      </div>
    </div>
  )
}
