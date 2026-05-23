export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense, Revenue } from '@/lib/types'
import { CATEGORIES, getUserName } from '@/lib/types'
import { parseISO } from 'date-fns'
import MonthSelector from '@/components/MonthSelector'
import CategoryIcon from '@/components/CategoryIcon'
import ExpenseRow from '@/components/ExpenseRow'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const selectedDate = monthParam ? parseISO(`${monthParam}-01`) : now
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth() + 1
  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const startDate = `${monthStr}-01`
  const endDate = `${monthStr}-31`

  const [expensesRes, revenuesRes] = await Promise.all([
    supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('revenues').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
  ])

  const expenses: Expense[] = (expensesRes.data as Expense[] | null) ?? []
  const revenues: Revenue[] = (revenuesRes.data as Revenue[] | null) ?? []
  const firstName = getUserName(user?.email ?? '')

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0)
  const balance = totalRevenues - totalExpenses
  const budgetPercent = totalRevenues > 0 ? Math.min((totalExpenses / totalRevenues) * 100, 100) : 0
  const isOverBudget = totalExpenses > totalRevenues && totalRevenues > 0

  const arthurTotal = expenses.filter(e => e.who === 'arthur').reduce((s, e) => s + e.amount, 0)
  const palomaTotal = expenses.filter(e => e.who === 'paloma').reduce((s, e) => s + e.amount, 0)

  const categoryTotals = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const recent = expenses.slice(0, 5)

  function formatAmount(n: number) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-black">Bonjour {firstName}</h1>
        <Suspense fallback={null}>
          <MonthSelector />
        </Suspense>
      </div>

      {/* Solde card */}
      <div className="rounded-[20px] bg-[#F7F7F7] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Solde du mois</p>
        <p className="text-[52px] font-bold mt-1 leading-none tracking-[-2px]"
          style={{ color: balance < 0 ? '#8A8A8A' : '#000000' }}>
          {balance >= 0 ? '+' : ''}{formatAmount(balance)} €
        </p>
        <p className="text-[13px] text-[#8A8A8A] mt-2">
          {balance >= 0 ? 'Économisé ce mois' : 'Déficit ce mois'}
        </p>
      </div>

      {/* Revenus / Dépenses */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/revenus" className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col justify-between min-h-[100px]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Revenus</p>
            <ChevronRight size={14} color="#8A8A8A" />
          </div>
          <p className="text-[22px] font-bold text-black mt-2 leading-tight">+{formatAmount(totalRevenues)} €</p>
        </Link>
        <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col justify-between min-h-[100px]">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Dépenses</p>
          <p className="text-[22px] font-bold text-black mt-2 leading-tight">-{formatAmount(totalExpenses)} €</p>
        </div>
      </div>

      {/* Budget progress */}
      {totalRevenues > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Budget utilisé</p>
            <p className="text-[13px] font-semibold text-black">{Math.round(budgetPercent)}%</p>
          </div>
          <div className="h-[6px] bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${budgetPercent}%`,
                background: isOverBudget ? '#8A8A8A' : '#000000',
              }}
            />
          </div>
          <p className="text-[12px] text-[#8A8A8A] mt-2">
            {isOverBudget
              ? `Vous avez dépassé vos revenus de ${formatAmount(totalExpenses - totalRevenues)} €`
              : `Reste ${formatAmount(totalRevenues - totalExpenses)} € disponibles`}
          </p>
        </div>
      )}

      {/* Arthur / Paloma split */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Dépenses par personne</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[16px] bg-[#F7F7F7] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Arthur</p>
            <p className="text-[24px] font-bold text-black mt-1 leading-tight">{formatAmount(arthurTotal)} €</p>
          </div>
          <div className="rounded-[16px] bg-[#F7F7F7] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Paloma</p>
            <p className="text-[24px] font-bold text-[#8A8A8A] mt-1 leading-tight">{formatAmount(palomaTotal)} €</p>
          </div>
        </div>
      </div>

      {/* Par catégorie */}
      {categoryTotals.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Par catégorie</p>
          <div className="flex flex-col gap-3">
            {categoryTotals.map(cat => (
              <div key={cat.value} className="flex items-center gap-3">
                <CategoryIcon category={cat.value} size={18} containerSize={36} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[14px] font-medium text-black">{cat.label}</span>
                    <span className="text-[14px] font-semibold text-black">{formatAmount(cat.total)} €</span>
                  </div>
                  <div className="h-[3px] bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full"
                      style={{ width: `${totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Récent */}
      {recent.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-1">Dépenses récentes</p>
          {recent.map(e => <ExpenseRow key={e.id} expense={e} />)}
        </div>
      )}

      {expenses.length === 0 && revenues.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[16px] text-[#8A8A8A]">Aucune transaction ce mois</p>
          <p className="text-[13px] text-[#8A8A8A] mt-1">Appuyez sur + pour commencer</p>
        </div>
      )}
    </div>
  )
}
