export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense } from '@/lib/types'
import { notFound } from 'next/navigation'
import EditExpenseForm from '@/components/EditExpenseForm'

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('expenses').select('*').eq('id', id).single()
  const expense = data as Expense | null
  if (!expense) notFound()
  return <EditExpenseForm expense={expense} />
}
