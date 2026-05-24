export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import EditSavingForm from '@/components/EditSavingForm'
import { redirect } from 'next/navigation'

export default async function EditSavingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()

  const { data: saving } = await supabase.from('savings').select('*').eq('id', id).single()
  if (!saving) redirect('/epargne')

  let existingAccounts: { who: 'arthur' | 'paloma'; account_name: string }[] = []
  try {
    const { data } = await supabase.from('savings').select('who, account_name').order('account_name')
    if (data) {
      const seen = new Set<string>()
      existingAccounts = (data as typeof existingAccounts).filter(a => {
        const key = `${a.who}::${a.account_name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
  } catch {
    // colonne manquante → formulaire sans autocomplétion
  }

  return <EditSavingForm saving={saving as Saving} existingAccounts={existingAccounts} />
}
