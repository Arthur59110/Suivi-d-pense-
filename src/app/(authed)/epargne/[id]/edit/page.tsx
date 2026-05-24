export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import EditSavingForm from '@/components/EditSavingForm'
import { redirect } from 'next/navigation'

export default async function EditSavingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  const [{ data: saving }, { data: accountsRaw }] = await Promise.all([
    supabase.from('savings').select('*').eq('id', id).single(),
    supabase.from('savings').select('who, account_name').order('account_name'),
  ])

  if (!saving) redirect('/epargne')

  const raw = (accountsRaw ?? []) as { who: 'arthur' | 'paloma'; account_name: string }[]
  const seen = new Set<string>()
  const existingAccounts = raw.filter(a => {
    const key = `${a.who}::${a.account_name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return <EditSavingForm saving={saving as Saving} existingAccounts={existingAccounts} />
}
