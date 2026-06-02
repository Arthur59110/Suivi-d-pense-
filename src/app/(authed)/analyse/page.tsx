export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense, Revenue, Saving, Budget } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import {
  parseISO,
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
  isSameYear,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import CategoryIcon from '@/components/CategoryIcon'
import AnalyseTabs from '@/components/AnalyseTabs'
import PeriodSelector from '@/components/PeriodSelector'
import RepartitionCard from '@/components/RepartitionCard'
import { Suspense } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatShort(n: number) {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}k`
  return Math.round(n).toString()
}

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string }>
}) {
  const { view: viewParam, period } = await searchParams
  const view: 'mois' | 'annee' = viewParam === 'annee' ? 'annee' : 'mois'
  const supabase = await getSupabaseServer()

  const now = new Date()

  let fetchStart: Date
  let fetchEnd: Date
  let referenceDate: Date

  if (view === 'annee') {
    const year = period ? parseInt(period, 10) : now.getFullYear()
    referenceDate = new Date(year, 0, 1)
    fetchStart = startOfYear(referenceDate)
    fetchEnd = endOfYear(referenceDate)
  } else {
    referenceDate = period ? parseISO(`${period}-01`) : now
    fetchStart = startOfMonth(subMonths(referenceDate, 5))
    fetchEnd = endOfMonth(referenceDate)
  }

  const startStr = format(fetchStart, 'yyyy-MM-dd')
  const endStr = format(fetchEnd, 'yyyy-MM-dd')

  const [expensesRes, revenuesRes, savingsRes, budgetsRes] = await Promise.all([
    supabase.from('expenses').select('*').gte('date', startStr).lte('date', endStr),
    supabase.from('revenues').select('*').gte('budget_month', startStr).lte('budget_month', endStr),
    supabase.from('savings').select('*').gte('date', startStr).lte('date', endStr),
    supabase.from('budgets').select('*'),
  ])

  const allExpenses: Expense[] = (expensesRes.data as Expense[] | null) ?? []
  // Les reports de solde ne sont pas de vrais revenus : on les exclut de l'analyse
  const allRevenues: Revenue[] = ((revenuesRes.data as Revenue[] | null) ?? [])
    .filter(r => !(r.description?.startsWith('Report ') ?? false))
  const allSavings: Saving[] = (savingsRes.data as Saving[] | null) ?? []
  const budgets: Budget[] = (budgetsRes.data as Budget[] | null) ?? []
  const budgetMap = new Map(budgets.map(b => [b.category, Number(b.amount)]))

  return (
    <div className="flex flex-col gap-5 px-5 pt-6">
      <h1 className="text-[22px] font-bold text-black">Analyse budget</h1>

      <Suspense fallback={<div className="h-11 rounded-[12px] bg-[#F7F7F7]" />}>
        <AnalyseTabs view={view} />
      </Suspense>

      <Suspense fallback={null}>
        <PeriodSelector mode={view} />
      </Suspense>

      {view === 'mois' ? (
        <MonthlyView
          referenceDate={referenceDate}
          expenses={allExpenses}
          revenues={allRevenues}
          savings={allSavings}
          budgets={budgetMap}
        />
      ) : (
        <YearlyView
          referenceDate={referenceDate}
          expenses={allExpenses}
          revenues={allRevenues}
          savings={allSavings}
        />
      )}
    </div>
  )
}

function MonthlyView({
  referenceDate,
  expenses,
  revenues,
  savings,
  budgets,
}: {
  referenceDate: Date
  expenses: Expense[]
  revenues: Revenue[]
  savings: Saving[]
  budgets: Map<string, number>
}) {
  const monthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), referenceDate) && e.category !== 'epargne')
  const monthRevenues = revenues.filter(r => isSameMonth(parseISO(r.date), referenceDate))
  const monthSavings = savings.filter(s => isSameMonth(parseISO(s.date), referenceDate))

  const prevMonth = subMonths(referenceDate, 1)
  const prevExpensesArr = expenses.filter(e => isSameMonth(parseISO(e.date), prevMonth) && e.category !== 'epargne')

  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = monthRevenues.reduce((s, r) => s + r.amount, 0)
  const totalSavings = monthSavings.reduce((s, sv) => s + sv.amount, 0)
  const balance = totalRevenues - totalExpenses - totalSavings
  const prevTotal = prevExpensesArr.reduce((s, e) => s + e.amount, 0)
  const variation = prevTotal > 0 ? ((totalExpenses - prevTotal) / prevTotal) * 100 : 0

  const months = eachMonthOfInterval({ start: subMonths(referenceDate, 5), end: referenceDate })
  const monthlyTotals = months.map(m => ({
    date: m,
    label: format(m, 'MMM', { locale: fr }),
    total: expenses.filter(e => isSameMonth(parseISO(e.date), m) && e.category !== 'epargne').reduce((s, e) => s + e.amount, 0),
  }))
  const maxMonthly = Math.max(...monthlyTotals.map(m => m.total), 1)
  const avg6 = monthlyTotals.reduce((s, m) => s + m.total, 0) / Math.max(monthlyTotals.length, 1)

  const categoryTotals = CATEGORIES.filter(c => c.value !== 'epargne').map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const topExpenses = [...monthExpenses].sort((a, b) => b.amount - a.amount).slice(0, 3)

  if (monthExpenses.length === 0 && monthRevenues.length === 0 && monthSavings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[16px] text-[#8A8A8A]">Aucune donnée pour ce mois</p>
        <p className="text-[13px] text-[#8A8A8A] mt-1">Naviguez vers un autre mois</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Solde card */}
      <div className="rounded-[20px] bg-[#F7F7F7] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Solde du mois</p>
        <p
          className="text-[40px] font-bold mt-1 leading-none tracking-[-1.5px]"
          style={{ color: balance < 0 ? '#8A8A8A' : '#000000' }}
        >
          {balance >= 0 ? '+' : ''}{formatAmount(balance)} €
        </p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Revenus</p>
            <p className="text-[14px] font-semibold text-black">+{formatAmount(totalRevenues)} €</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Dépenses</p>
            <p className="text-[14px] font-semibold text-black">-{formatAmount(totalExpenses)} €</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Épargne</p>
            <p className="text-[14px] font-semibold text-black">-{formatAmount(totalSavings)} €</p>
          </div>
        </div>
      </div>

      {/* Comparaison vs mois précédent */}
      {prevTotal > 0 && (
        <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            {variation > 5 ? (
              <TrendingUp size={20} color="#000" />
            ) : variation < -5 ? (
              <TrendingDown size={20} color="#000" />
            ) : (
              <Minus size={20} color="#000" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-black">
              {variation > 0 ? '+' : ''}{variation.toFixed(0)}% vs {format(prevMonth, 'MMMM', { locale: fr })}
            </p>
            <p className="text-[12px] text-[#8A8A8A] mt-0.5">
              {variation > 0
                ? `Soit ${formatAmount(totalExpenses - prevTotal)} € de plus`
                : variation < 0
                  ? `Soit ${formatAmount(prevTotal - totalExpenses)} € de moins`
                  : 'Dépenses stables'}
            </p>
          </div>
        </div>
      )}

      {/* 6 derniers mois */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">6 derniers mois</p>
          <p className="text-[12px] text-[#8A8A8A]">moy. {formatAmount(avg6)} €</p>
        </div>
        <div className="rounded-[20px] bg-[#F7F7F7] px-4 pt-3 pb-4">
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {monthlyTotals.map((m, i) => {
              const height = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0
              const isCurrent = i === monthlyTotals.length - 1
              const periodParam = format(m.date, 'yyyy-MM')
              return (
                <Link
                  key={m.label + i}
                  href={`/analyse?view=mois&period=${periodParam}`}
                  className="flex-1 flex flex-col items-center justify-end gap-1.5"
                  style={{ height: '100%' }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: isCurrent ? '#000' : '#8A8A8A' }}>
                    {m.total > 0 ? `${formatShort(m.total)} €` : '–'}
                  </span>
                  <div className="w-full" style={{ height: `${Math.max(height, 3)}%`, background: isCurrent ? '#000' : '#D4D4D4', borderRadius: '5px 5px 2px 2px' }} />
                  <span className="text-[11px] font-semibold capitalize" style={{ color: isCurrent ? '#000' : '#8A8A8A' }}>
                    {format(m.date, 'MMM', { locale: fr })}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Arthur vs Paloma */}
      {totalExpenses > 0 && <RepartitionCard expenses={monthExpenses} />}

      {/* Budgets par catégorie */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
            Budgets par catégorie
          </p>
          <Link href="/budgets" className="flex items-center gap-1 text-[12px] font-semibold text-black">
            <Settings2 size={13} color="#000" />
            Gérer
          </Link>
        </div>
        {budgets.size === 0 ? (
          <Link
            href="/budgets"
            className="block rounded-[16px] bg-[#F7F7F7] p-4 text-center"
          >
            <p className="text-[13px] text-[#8A8A8A]">
              Aucun budget défini.{' '}
              <span className="text-black font-semibold underline">Définir mes budgets</span>
            </p>
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            {CATEGORIES.filter(cat => budgets.has(cat.value)).map(cat => {
              const budget = budgets.get(cat.value) ?? 0
              const spent = monthExpenses
                .filter(e => e.category === cat.value && !e.is_personal)
                .reduce((s, e) => s + e.amount, 0)
              const pct = budget > 0 ? (spent / budget) * 100 : 0
              const over = pct > 100
              return (
                <div key={cat.value} className="flex items-center gap-3">
                  <CategoryIcon category={cat.value} size={18} containerSize={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[14px] font-medium text-black">{cat.label}</span>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: over ? '#D04030' : '#000' }}
                      >
                        {formatAmount(spent)} / {formatAmount(budget)} €
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[6px] bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: over ? '#D04030' : pct > 85 ? '#8A8A8A' : '#000',
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-semibold w-10 text-right"
                        style={{ color: over ? '#D04030' : '#8A8A8A' }}
                      >
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top catégories */}
      {categoryTotals.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
            Par catégorie
          </p>
          <div className="flex flex-col gap-3">
            {categoryTotals.map(cat => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
              return (
                <div key={cat.value} className="flex items-center gap-3">
                  <CategoryIcon category={cat.value} size={18} containerSize={36} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[14px] font-medium text-black">{cat.label}</span>
                      <span className="text-[14px] font-semibold text-black">
                        {formatAmount(cat.total)} €
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[3px] bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#8A8A8A] w-9 text-right">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top 3 dépenses */}
      {topExpenses.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
            Plus grosses dépenses
          </p>
          <div className="flex flex-col gap-2">
            {topExpenses.map(e => {
              const cat = CATEGORIES.find(c => c.value === e.category)
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-[14px] bg-[#F7F7F7] px-3 py-3"
                >
                  <CategoryIcon category={e.category} size={16} containerSize={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-black truncate">
                      {e.description || cat?.label || e.category}
                    </p>
                    <p className="text-[11px] text-[#8A8A8A]">
                      {format(parseISO(e.date), 'd MMM', { locale: fr })} ·{' '}
                      {e.who === 'arthur' ? 'Arthur' : 'Paloma'}
                    </p>
                  </div>
                  <p className="text-[15px] font-bold text-black">-{formatAmount(e.amount)} €</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function YearlyView({
  referenceDate,
  expenses,
  revenues,
  savings,
}: {
  referenceDate: Date
  expenses: Expense[]
  revenues: Revenue[]
  savings: Saving[]
}) {
  const yearExpenses = expenses.filter(e => isSameYear(parseISO(e.date), referenceDate) && e.category !== 'epargne')
  const yearRevenues = revenues.filter(r => isSameYear(parseISO(r.date), referenceDate))
  const yearSavings = savings.filter(s => isSameYear(parseISO(s.date), referenceDate))

  const totalExpenses = yearExpenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = yearRevenues.reduce((s, r) => s + r.amount, 0)
  const totalSavings = yearSavings.reduce((s, sv) => s + sv.amount, 0)
  const balance = totalRevenues - totalExpenses - totalSavings

  const months = eachMonthOfInterval({
    start: startOfYear(referenceDate),
    end: endOfYear(referenceDate),
  })
  const monthlyTotals = months.map(m => {
    const exp = yearExpenses.filter(e => isSameMonth(parseISO(e.date), m)).reduce((s, e) => s + e.amount, 0)
    const rev = yearRevenues.filter(r => isSameMonth(parseISO(r.date), m)).reduce((s, r) => s + r.amount, 0)
    return { date: m, label: format(m, 'MMM', { locale: fr }), expenses: exp, revenues: rev }
  })

  const maxMonthly = Math.max(...monthlyTotals.map(m => Math.max(m.expenses, m.revenues)), 1)
  const monthsWithExpenses = monthlyTotals.filter(m => m.expenses > 0).length || 1
  const avgMonthly = totalExpenses / monthsWithExpenses

  const heaviestMonth = monthlyTotals.reduce(
    (max, m) => (m.expenses > max.expenses ? m : max),
    monthlyTotals[0] ?? { date: referenceDate, label: '', expenses: 0, revenues: 0 },
  )

  const categoryTotals = CATEGORIES.filter(c => c.value !== 'epargne').map(cat => ({
    ...cat,
    total: yearExpenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  if (yearExpenses.length === 0 && yearRevenues.length === 0 && yearSavings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-[16px] text-[#8A8A8A]">Aucune donnée pour cette année</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Solde annuel */}
      <div className="rounded-[20px] bg-[#F7F7F7] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Solde annuel</p>
        <p
          className="text-[40px] font-bold mt-1 leading-none tracking-[-1.5px]"
          style={{ color: balance < 0 ? '#8A8A8A' : '#000000' }}
        >
          {balance >= 0 ? '+' : ''}{formatAmount(balance)} €
        </p>
        <div className="flex gap-3 mt-4">
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Revenus</p>
            <p className="text-[14px] font-semibold text-black">+{formatAmount(totalRevenues)} €</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Dépenses</p>
            <p className="text-[14px] font-semibold text-black">-{formatAmount(totalExpenses)} €</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Épargne</p>
            <p className="text-[14px] font-semibold text-black">-{formatAmount(totalSavings)} €</p>
          </div>
        </div>
      </div>

      {/* Moyenne et mois le plus cher */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-[#F7F7F7] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Moy. / mois</p>
          <p className="text-[20px] font-bold text-black mt-1 leading-tight">{formatAmount(avgMonthly)} €</p>
        </div>
        <div className="rounded-[16px] bg-[#F7F7F7] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Mois +cher</p>
          <p className="text-[20px] font-bold text-black mt-1 leading-tight capitalize">
            {heaviestMonth.label}
          </p>
          <p className="text-[12px] text-[#8A8A8A] mt-0.5">{formatAmount(heaviestMonth.expenses)} €</p>
        </div>
      </div>

      {/* Graphique 12 mois */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
          Dépenses par mois
        </p>
        <div className="rounded-[20px] bg-[#F7F7F7] px-4 pt-3 pb-4">
          <div className="flex items-end gap-1" style={{ height: 160 }}>
            {monthlyTotals.map((m, i) => {
              const height = maxMonthly > 0 ? (m.expenses / maxMonthly) * 100 : 0
              const isHeaviest = m.expenses === heaviestMonth.expenses && m.expenses > 0
              const periodParam = format(m.date, 'yyyy-MM')
              return (
                <Link
                  key={i}
                  href={`/analyse?view=mois&period=${periodParam}`}
                  className="flex-1 flex flex-col items-center justify-end gap-1.5"
                  style={{ height: '100%' }}
                >
                  <span className="text-[9px] font-semibold" style={{ color: isHeaviest ? '#000' : '#8A8A8A' }}>
                    {m.expenses > 0 ? `${formatShort(m.expenses)}` : ''}
                  </span>
                  <div
                    className="w-full"
                    style={{
                      height: `${Math.max(height, 3)}%`,
                      background: isHeaviest ? '#000000' : '#D4D4D4',
                      borderRadius: '4px 4px 2px 2px',
                    }}
                  />
                  <span className="text-[9px] font-semibold capitalize" style={{ color: isHeaviest ? '#000' : '#8A8A8A' }}>
                    {m.label[0]}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Arthur vs Paloma annuel */}
      {totalExpenses > 0 && <RepartitionCard expenses={yearExpenses} title="Répartition annuelle" />}

      {/* Top catégories annuelles */}
      {categoryTotals.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
            Par catégorie
          </p>
          <div className="flex flex-col gap-3">
            {categoryTotals.map(cat => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
              return (
                <div key={cat.value} className="flex items-center gap-3">
                  <CategoryIcon category={cat.value} size={18} containerSize={36} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[14px] font-medium text-black">{cat.label}</span>
                      <span className="text-[14px] font-semibold text-black">
                        {formatAmount(cat.total)} €
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[3px] bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#8A8A8A] w-9 text-right">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
