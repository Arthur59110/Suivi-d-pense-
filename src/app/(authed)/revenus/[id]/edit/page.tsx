export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Revenue } from '@/lib/types'
import { notFound } from 'next/navigation'
import EditRevenueForm from '@/components/EditRevenueForm'

export default async function EditRevenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('revenues').select('*').eq('id', id).single()
  const revenue = data as Revenue | null
  if (!revenue) notFound()
  return <EditRevenueForm revenue={revenue} />
}
