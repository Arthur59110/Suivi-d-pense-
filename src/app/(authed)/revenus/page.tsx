export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Revenue } from '@/lib/types'
import RevenueRow from '@/components/RevenueRow'
import PersonFilter from '@/components/PersonFilter'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PageSwitcher from '@/components/PageSwitcher'
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function groupLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "Aujourd'hui"
  if (isYesterday(date)) return 'Hier'
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    const day = format(date, 'EEEE', { locale: fr })
    return day.charAt(0).toUpperCase() + day.slice(1)
  }
  if (isThisYear(date)) {
    const lbl = format(date, 'EEEE d MMMM', { locale: fr })
    return lbl.charAt(0).toUpperCase() + lbl.slice(1)
  }
  const lbl = format(date, 'd MMMM yyyy', { locale: fr })
  return lbl.charAt(0).toUpperCase() + lbl.slice(1)
}

export default async function RevenusPage({
  searchParams,
}: {
  searchParams: Promise<{ who?: string }>
}) {
  const { who: whoFilter } = await searchParams
  const supabase = await getSupabaseServer()

  let query = supabase.from('revenues').select('*').order('date', { ascending: false })
  if (whoFilter && whoFilter !== 'all') query = query.eq('who', whoFilter)

  const { data } = await query
  const revenues: Revenue[] = (data as Revenue[] | null) ?? []

  const total = revenues.reduce((s, r) => s + r.amount, 0)
  const count = revenues.length

  const groups = new Map<string, Revenue[]>()
  for (const r of revenues) {
    const key = format(startOfDay(parseISO(r.date)), 'yyyy-MM-dd')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }

  return (
    <div className="flex flex-col pt-6 gap-5">
      {/* Header */}
      <div className="px-5 flex items-center justify-between">
        <PageSwitcher current="revenus" />
        <Link
          href="/ajouter"
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
        >
          <Plus size={20} color="white" />
        </Link>
      </div>

      {/* Carte récap */}
      <div className="px-5">
        <div className="rounded-[20px] bg-[#F7F7F7] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
            {whoFilter && whoFilter !== 'all'
              ? `Revenus ${whoFilter === 'arthur' ? 'Arthur' : 'Paloma'}`
              : 'Total des revenus'}
          </p>
          <p className="text-[36px] font-bold text-black mt-1 leading-none tracking-[-1px]">
            +{formatAmount(total)} €
          </p>
          <p className="text-[13px] text-[#8A8A8A] mt-2">
            {count} {count > 1 ? 'revenus' : 'revenu'}
          </p>
        </div>
      </div>

      {/* Filtre par personne */}
      <div className="px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
          Personne
        </p>
        <PersonFilter activeWho={whoFilter} />
      </div>

      {/* Liste groupée par jour */}
      <div className="px-5">
        {count === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[16px] text-[#8A8A8A]">Aucun revenu</p>
            <p className="text-[13px] text-[#8A8A8A] mt-1">
              {whoFilter ? 'Essayez un autre filtre' : 'Appuyez sur + pour en ajouter un'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from(groups.entries()).map(([dateKey, items]) => {
              const dayTotal = items.reduce((s, r) => s + r.amount, 0)
              return (
                <div key={dateKey}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">
                      {groupLabel(dateKey)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#8A8A8A]">
                      +{formatAmount(dayTotal)} €
                    </span>
                  </div>
                  <div>
                    {items.map(r => <RevenueRow key={r.id} revenue={r} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
