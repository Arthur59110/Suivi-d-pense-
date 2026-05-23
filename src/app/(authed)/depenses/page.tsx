export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense } from '@/lib/types'
import FilterChips from '@/components/FilterChips'
import ExpenseRow from '@/components/ExpenseRow'

export default async function DepensesPage({
  searchParams,
}: {
  searchParams: Promise<{ who?: string; cat?: string }>
}) {
  const { who: whoFilter, cat: catFilter } = await searchParams
  const supabase = await getSupabaseServer()

  let query = supabase.from('expenses').select('*').order('date', { ascending: false })
  if (whoFilter && whoFilter !== 'all') query = query.eq('who', whoFilter)
  if (catFilter) query = query.eq('category', catFilter)

  const { data } = await query
  const expenses: Expense[] = (data as Expense[] | null) ?? []

  return (
    <div className="flex flex-col pt-6">
      <div className="px-5 mb-4">
        <h1 className="text-[28px] font-bold text-black">Dépenses</h1>
      </div>
      <FilterChips activeWho={whoFilter} activeCat={catFilter} />
      <div className="px-5 mt-2">
        {expenses.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[16px] text-[#8A8A8A]">Aucune dépense</p>
          </div>
        ) : (
          expenses.map(e => <ExpenseRow key={e.id} expense={e} />)
        )}
      </div>
    </div>
  )
}
