export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import NewSavingForm from '@/components/NewSavingForm'
import { Suspense } from 'react'

export default async function NewSavingPage() {
  let existingAccounts: { who: 'arthur' | 'paloma'; account_name: string }[] = []

  try {
    const supabase = await getSupabaseServer()
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

  return <Suspense><NewSavingForm existingAccounts={existingAccounts} /></Suspense>
}
