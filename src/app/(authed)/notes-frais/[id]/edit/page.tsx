export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { ExpenseNote } from '@/lib/types'
import EditExpenseNoteForm from '@/components/EditExpenseNoteForm'
import { notFound } from 'next/navigation'

export default async function EditExpenseNotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('expense_notes').select('*').eq('id', id).single()
  if (!data) notFound()
  return <EditExpenseNoteForm note={data as ExpenseNote} />
}
