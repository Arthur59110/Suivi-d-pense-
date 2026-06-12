export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import { getWhoFromEmail } from '@/lib/types'
import NewExpenseNoteForm from '@/components/NewExpenseNoteForm'

export default async function NewExpenseNotePage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const who = getWhoFromEmail(user?.email ?? '')
  return <NewExpenseNoteForm defaultWho={who} />
}
