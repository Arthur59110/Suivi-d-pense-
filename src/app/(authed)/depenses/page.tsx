export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import PersonFilter from '@/components/PersonFilter'
import CategoryFilter from '@/components/CategoryFilter'
import ExpenseRow from '@/components/ExpenseRow'
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
    const lbl = format(date, "EEEE d MMMM", { locale: fr })
    return lbl.charAt(0).toUpperCase() + lbl.slice(1)
  }
  const lbl = format(date, "d MMMM yyyy", { locale: fr })
  return lbl.charAt(0).toUpperCase() + lbl.slice(1)
}

export default async function DepensesPage({
  searchParams,
}: {
  searchParams: Promise<{ who?: string; cat?: string }>
}) {
  const { who: whoFilter, cat: catFilter } = await searchParams
  const supabase = await getSupabaseServer()

  let query = supabase.from('expenses').select('*').order('date', { ascending: false })
  if (whoFilter && whoFilter !== 'all') query = query.eq('who', whoFilter)
  if (catFilter) query = query.eq('category', catFilter)

  const { data } = await query
  const expenses: Expense[] = (data as Expense[] | null) ?? []

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const count = expenses.length

  const activeCategoryLabel = catFilter
    ? CATEGORIES.find(c => c.value === catFilter)?.label ?? catFilter
    : null

  // Grouper par jour
  const groups = new Map<string, Expense[]>()
  for (const e of expenses) {
    const key = format(startOfDay(parseISO(e.date)), 'yyyy-MM-dd')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }

  return (
    <div className="flex flex-col pt-6 gap-5">
      {/* Header */}
      <div className="px-5 flex items-center justify-between">
        <PageSwitcher current="depenses" />
        <Link
          href="/ajouter"
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
        >
          <Plus size={20} color="white" />
        </Link>
      </div>

      {/* Carte récap du filtre */}
      <div className="px-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="rounded-[20px] bg-[#F7F7F7] p-5 transition-transform active:scale-[0.98] duration-100">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
            {whoFilter && whoFilter !== 'all'
              ? `Dépenses ${whoFilter === 'arthur' ? 'Arthur' : 'Paloma'}`
              : activeCategoryLabel
                ? `Catégorie · ${activeCategoryLabel}`
                : 'Total des dépenses'}
          </p>
          <p className="text-[36px] font-bold text-black mt-1 leading-none tracking-[-1px]">
            {formatAmount(total)} €
          </p>
          <p className="text-[13px] text-[#8A8A8A] mt-2">
            {count} {count > 1 ? 'dépenses' : 'dépense'}
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

      {/* Filtre par catégorie */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3 px-5">
          Catégorie
        </p>
        <div className="px-5">
          <CategoryFilter activeCat={catFilter} />
        </div>
      </div>

      {/* Liste groupée par jour */}
      <div className="px-5">
        {count === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[16px] text-[#8A8A8A]">Aucune dépense</p>
            <p className="text-[13px] text-[#8A8A8A] mt-1">
              {whoFilter || catFilter
                ? 'Essayez un autre filtre'
                : 'Appuyez sur + pour en ajouter une'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 stagger-list">
            {Array.from(groups.entries()).map(([dateKey, items]) => {
              const dayTotal = items.reduce((s, e) => s + e.amount, 0)
              return (
                <div key={dateKey}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[12px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">
                      {groupLabel(dateKey)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#8A8A8A]">
                      -{formatAmount(dayTotal)} €
                    </span>
                  </div>
                  <div className="row-list">
                    {items.map(e => <ExpenseRow key={e.id} expense={e} />)}
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
