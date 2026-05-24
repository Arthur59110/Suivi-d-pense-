export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense, Revenue, Saving } from '@/lib/types'
import { CATEGORIES, getUserName } from '@/lib/types'
import { parseISO, endOfMonth, format } from 'date-fns'
import MonthSelector from '@/components/MonthSelector'
import DailyMessage from '@/components/DailyMessage'
import CategoryIcon from '@/components/CategoryIcon'
import ExpenseRow from '@/components/ExpenseRow'
import { AvatarArthur, AvatarPaloma } from '@/components/Avatars'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, PiggyBank } from 'lucide-react'

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
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd')

  const [expensesRes, revenuesRes, savingsRes] = await Promise.all([
    supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('revenues').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('savings').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
  ])

  const expenses: Expense[] = (expensesRes.data as Expense[] | null) ?? []
  const revenues: Revenue[] = (revenuesRes.data as Revenue[] | null) ?? []
  const savings: Saving[] = (savingsRes.data as Saving[] | null) ?? []
  const firstName = getUserName(user?.email ?? '')

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0)
  const totalSavings = savings.reduce((s, sv) => s + sv.amount, 0)
  const consumed = totalExpenses + totalSavings
  const balance = totalRevenues - consumed
  const budgetPercent = totalRevenues > 0 ? Math.min((consumed / totalRevenues) * 100, 100) : 0
  const isOverBudget = consumed > totalRevenues && totalRevenues > 0

  const arthurExpenses = expenses.filter(e => e.who === 'arthur').reduce((s, e) => s + e.amount, 0)
  const palomaExpenses = expenses.filter(e => e.who === 'paloma').reduce((s, e) => s + e.amount, 0)
  const arthurSavings = savings.filter(s => s.who === 'arthur').reduce((sum, s) => sum + s.amount, 0)
  const palomaSavings = savings.filter(s => s.who === 'paloma').reduce((sum, s) => sum + s.amount, 0)
  const arthurRevenues = revenues.filter(r => r.who === 'arthur').reduce((s, r) => s + r.amount, 0)
  const palomaRevenues = revenues.filter(r => r.who === 'paloma').reduce((s, r) => s + r.amount, 0)
  const arthurNet = arthurRevenues - arthurExpenses - arthurSavings
  const palomaNet = palomaRevenues - palomaExpenses - palomaSavings

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
        <Link href="/profil" className="flex items-center gap-3 active:opacity-70">
          {firstName === 'Arthur' ? <AvatarArthur size={44} /> : <AvatarPaloma size={44} />}
          <div>
            <h1 className="text-[22px] font-bold text-black leading-tight">Bonjour {firstName}</h1>
            <DailyMessage />
          </div>
        </Link>
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
          {balance >= 0
            ? totalSavings > 0
              ? `Restant après dépenses et ${formatAmount(totalSavings)} € mis de côté`
              : 'Restant après dépenses'
            : 'Déficit ce mois'}
        </p>
      </div>

      {/* Revenus / Dépenses / Épargne */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/revenus" className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Revenus</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">+{formatAmount(totalRevenues)} €</p>
        </Link>
        <Link href="/depenses" className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Dépenses</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">-{formatAmount(totalExpenses)} €</p>
        </Link>
        <Link href="/epargne" className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Épargne</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">-{formatAmount(totalSavings)} €</p>
        </Link>
      </div>

      {/* Budget progress */}
      {totalRevenues > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Revenus utilisés</p>
            <p className="text-[13px] font-semibold text-black">{Math.round(budgetPercent)}%</p>
          </div>
          <div className="h-[6px] bg-[#E5E5E5] rounded-full overflow-hidden flex">
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min((totalExpenses / totalRevenues) * 100, 100)}%`,
                background: isOverBudget ? '#8A8A8A' : '#000000',
              }}
            />
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.min((totalSavings / totalRevenues) * 100, Math.max(0, 100 - (totalExpenses / totalRevenues) * 100))}%`,
                background: '#8A8A8A',
              }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#8A8A8A]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-black" />
              <span>Dépenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#8A8A8A]" />
              <span>Épargne</span>
            </div>
            <span className="ml-auto">
              {isOverBudget
                ? `Dépassement ${formatAmount(consumed - totalRevenues)} €`
                : `Reste ${formatAmount(totalRevenues - consumed)} €`}
            </span>
          </div>
        </div>
      )}

      {/* Par personne */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Par personne</p>
        <div className="grid grid-cols-2 gap-3">
          <PersonCard
            name="Arthur"
            revenues={arthurRevenues}
            expenses={arthurExpenses}
            savings={arthurSavings}
            net={arthurNet}
            isActive
          />
          <PersonCard
            name="Paloma"
            revenues={palomaRevenues}
            expenses={palomaExpenses}
            savings={palomaSavings}
            net={palomaNet}
          />
        </div>
      </div>

      {/* Épargne du mois highlight */}
      {totalSavings > 0 && (
        <Link
          href="/epargne"
          className="rounded-[16px] bg-[#F7F7F7] p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <PiggyBank size={20} color="white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Mis de côté ce mois</p>
            <p className="text-[18px] font-bold text-black leading-tight mt-0.5">
              {formatAmount(totalSavings)} €
            </p>
          </div>
          <ChevronRight size={18} color="#8A8A8A" />
        </Link>
      )}

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

      {expenses.length === 0 && revenues.length === 0 && savings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[16px] text-[#8A8A8A]">Aucune transaction ce mois</p>
          <p className="text-[13px] text-[#8A8A8A] mt-1">Appuyez sur + pour commencer</p>
        </div>
      )}
    </div>
  )
}

function PersonCard({
  name,
  revenues,
  expenses,
  savings,
  net,
  isActive = false,
}: {
  name: string
  revenues: number
  expenses: number
  savings: number
  net: number
  isActive?: boolean
}) {
  function f(n: number) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return (
    <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-black">{name}</p>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: isActive ? '#000' : '#E5E5E5' }}
        >
          <span
            className="text-[10px] font-bold"
            style={{ color: isActive ? '#fff' : '#000' }}
          >
            {name[0]}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#8A8A8A]">Revenus</span>
          <span className="text-black font-medium">+{f(revenues)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8A8A8A]">Dépenses</span>
          <span className="text-black font-medium">-{f(expenses)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8A8A8A]">Épargne</span>
          <span className="text-black font-medium">-{f(savings)} €</span>
        </div>
      </div>
      <div className="h-px bg-[#E5E5E5] my-1" />
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8A8A8A]">Reste</span>
        <span
          className="text-[16px] font-bold"
          style={{ color: net < 0 ? '#8A8A8A' : '#000' }}
        >
          {net >= 0 ? '+' : ''}{f(net)} €
        </span>
      </div>
    </div>
  )
}
