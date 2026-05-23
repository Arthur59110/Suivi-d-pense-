export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Revenue } from '@/lib/types'
import RevenueRow from '@/components/RevenueRow'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'

export default async function RevenusPage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('revenues')
    .select('*')
    .order('date', { ascending: false })
  const revenues: Revenue[] = (data as Revenue[] | null) ?? []

  return (
    <div className="flex flex-col pt-4 px-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} color="#000" />
          </Link>
          <h1 className="text-[28px] font-bold text-black">Revenus</h1>
        </div>
        <Link
          href="/revenus/new"
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
        >
          <Plus size={20} color="white" />
        </Link>
      </div>
      {revenues.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[16px] text-[#8A8A8A]">Aucun revenu</p>
          <Link href="/revenus/new" className="text-[13px] text-black underline mt-2 inline-block">
            Ajouter votre premier revenu
          </Link>
        </div>
      ) : (
        <div>{revenues.map(r => <RevenueRow key={r.id} revenue={r} />)}</div>
      )}
    </div>
  )
}
