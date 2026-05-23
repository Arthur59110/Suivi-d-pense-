export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import EditSavingForm from '@/components/EditSavingForm'
import { redirect } from 'next/navigation'

export default async function EditSavingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('savings').select('*').eq('id', id).single()
  if (!data) redirect('/epargne')
  return <EditSavingForm saving={data as Saving} />
}
