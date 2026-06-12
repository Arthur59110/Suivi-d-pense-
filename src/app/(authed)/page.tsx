export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Expense, Revenue, Saving, ExpenseNote } from '@/lib/types'
import { CATEGORIES, getUserName } from '@/lib/types'
import { parseISO, endOfMonth, format, subMonths } from 'date-fns'
import MonthSelector from '@/components/MonthSelector'
import CategoryIcon from '@/components/CategoryIcon'
import ExpenseRow from '@/components/ExpenseRow'
import { AvatarArthur, AvatarPaloma } from '@/components/Avatars'
import CountUp from '@/components/CountUp'
import AnimatedBar from '@/components/AnimatedBar'
import ExpenseNotesCard from '@/components/ExpenseNotesCard'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, PiggyBank } from 'lucide-react'

const MONTHS_FULL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const MONTHS_SHORT = ['Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.']

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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

  // Auto-carry : quand on ouvre le mois courant, reporter automatiquement
  // le solde du mois précédent s'il ne l'a pas encore été
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const prevDate = subMonths(selectedDate, 1)
  const prevMonthStr = format(prevDate, 'yyyy-MM')
  const prevReportLabel = `Report ${MONTHS_FULL[prevDate.getMonth()]} ${prevDate.getFullYear()}`

  if (isCurrentMonth) {
    const prevStart = `${prevMonthStr}-01`
    const prevEnd = format(endOfMonth(prevDate), 'yyyy-MM-dd')

    const { data: existing } = await supabase
      .from('revenues')
      .select('id')
      .eq('description', prevReportLabel)
      .eq('budget_month', startDate)
      .limit(1)

    if (!existing?.length) {
      const [pExpRes, pRevRes, pSavRes, pNotesAdvRes, pNotesReimbRes] = await Promise.all([
        supabase.from('expenses').select('amount, category, who').gte('date', prevStart).lte('date', prevEnd),
        supabase.from('revenues').select('amount, who').gte('budget_month', prevStart).lte('budget_month', prevEnd),
        supabase.from('savings').select('amount, who, type').gte('date', prevStart).lte('date', prevEnd),
        supabase.from('expense_notes').select('amount, who').gte('date', prevStart).lte('date', prevEnd),
        supabase.from('expense_notes').select('amount, who').gte('reimbursed_date', prevStart).lte('reimbursed_date', prevEnd),
      ])

      type R = { amount: number; who: string }
      type E = { amount: number; category: string; who: string }
      type S = { amount: number; who: string; type: string }
      type N = { amount: number; who: string }

      const pExp = ((pExpRes.data ?? []) as E[]).filter(e => e.category !== 'epargne')
      const pRev = (pRevRes.data ?? []) as R[]
      const pSav = (pSavRes.data ?? []) as S[]
      const pNotesAdv = (pNotesAdvRes.data ?? []) as N[]
      const pNotesReimb = (pNotesReimbRes.data ?? []) as N[]

      const sumRev = (who: string) => pRev.filter(r => r.who === who).reduce((s, r) => s + r.amount, 0)
      const sumExp = (who: string) => pExp.filter(e => e.who === who).reduce((s, e) => s + e.amount, 0)
      const netSav = (who: string) =>
        pSav.filter(s => s.who === who && s.type === 'deposit').reduce((a, s) => a + s.amount, 0)
        - pSav.filter(s => s.who === who && s.type === 'withdrawal').reduce((a, s) => a + s.amount, 0)
      const notesImpact = (who: string) =>
        pNotesAdv.filter(n => n.who === who).reduce((a, n) => a + n.amount, 0)
        - pNotesReimb.filter(n => n.who === who).reduce((a, n) => a + n.amount, 0)

      const aNet = Math.max(sumRev('arthur') - sumExp('arthur') - netSav('arthur') - notesImpact('arthur'), 0)
      const pNet = Math.max(sumRev('paloma') - sumExp('paloma') - netSav('paloma') - notesImpact('paloma'), 0)

      const inserts: { amount: number; description: string; source: string; who: string; date: string; budget_month: string }[] = []
      if (aNet > 0.01) inserts.push({ amount: Math.round(aNet * 100) / 100, description: prevReportLabel, source: 'autre', who: 'arthur', date: startDate, budget_month: startDate })
      if (pNet > 0.01) inserts.push({ amount: Math.round(pNet * 100) / 100, description: prevReportLabel, source: 'autre', who: 'paloma', date: startDate, budget_month: startDate })
      if (inserts.length > 0) await supabase.from('revenues').insert(inserts)
    }
  }

  // Données du mois affiché (le report auto est déjà inséré si nécessaire)
  const [expensesRes, revenuesRes, savingsRes, notesAdvancedRes, notesReimbursedRes] = await Promise.all([
    supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('revenues').select('*').gte('budget_month', startDate).lte('budget_month', endDate).order('date', { ascending: false }),
    supabase.from('savings').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    // Notes de frais avancées ce mois (peu importe l'état de remboursement)
    supabase.from('expense_notes').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    // Notes remboursées ce mois (la note peut avoir été avancée n'importe quand)
    supabase.from('expense_notes').select('*').gte('reimbursed_date', startDate).lte('reimbursed_date', endDate),
  ])

  const expenses: Expense[] = (expensesRes.data as Expense[] | null) ?? []
  const revenues: Revenue[] = (revenuesRes.data as Revenue[] | null) ?? []
  const savings: Saving[]   = (savingsRes.data as Saving[]   | null) ?? []
  const notesAdvanced: ExpenseNote[] = (notesAdvancedRes.data as ExpenseNote[] | null) ?? []
  const notesReimbursedThisMonth: ExpenseNote[] = (notesReimbursedRes.data as ExpenseNote[] | null) ?? []
  const firstName = getUserName(user?.email ?? '')

  // Jambe sortante : "Report {ce mois}" inséré dans le mois suivant → déduit du solde ici
  const thisMonthReportLabel = `Report ${MONTHS_FULL[month - 1]} ${year}`
  const { data: outData } = await supabase
    .from('revenues')
    .select('amount, who, budget_month')
    .eq('description', thisMonthReportLabel)
  const outRows = (outData as Pick<Revenue, 'amount' | 'who' | 'budget_month'>[] | null) ?? []
  const reportedOut = outRows.reduce((s, r) => s + r.amount, 0)
  const reportedOutArthur = outRows.filter(r => r.who === 'arthur').reduce((s, r) => s + r.amount, 0)
  const reportedOutPaloma = outRows.filter(r => r.who === 'paloma').reduce((s, r) => s + r.amount, 0)
  const outTargetDate = outRows[0]?.budget_month ? parseISO(outRows[0].budget_month as string) : null
  const outTargetLabel = outTargetDate
    ? `${MONTHS_SHORT[outTargetDate.getMonth()]} ${outTargetDate.getFullYear()}`
    : ''

  // Le report entrant n'est pas un vrai revenu : on l'isole pour qu'il alimente
  // le solde sans gonfler le total des revenus du mois
  const isReport = (r: Revenue) => r.description?.startsWith('Report ') ?? false
  const realRevenues = revenues.filter(r => !isReport(r))
  const reportInRows = revenues.filter(isReport)
  const reportIn = reportInRows.reduce((s, r) => s + r.amount, 0)
  const reportInArthur = reportInRows.filter(r => r.who === 'arthur').reduce((s, r) => s + r.amount, 0)
  const reportInPaloma = reportInRows.filter(r => r.who === 'paloma').reduce((s, r) => s + r.amount, 0)

  const realExpenses = expenses.filter(e => e.category !== 'epargne')
  const totalExpenses = realExpenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = realRevenues.reduce((s, r) => s + r.amount, 0)
  const totalSavingsDeposited = savings.filter(sv => sv.type === 'deposit').reduce((s, sv) => s + sv.amount, 0)
  const totalSavingsWithdrawn = savings.filter(sv => sv.type === 'withdrawal').reduce((s, sv) => s + sv.amount, 0)
  const netMonthlySavings = totalSavingsDeposited - totalSavingsWithdrawn

  // Notes de frais : avances de ce mois (sortie) - remboursements reçus ce mois (entrée)
  const notesAdvancedTotal = notesAdvanced.reduce((s, n) => s + n.amount, 0)
  const notesReimbursedTotal = notesReimbursedThisMonth.reduce((s, n) => s + n.amount, 0)
  const notesNetImpact = notesAdvancedTotal - notesReimbursedTotal
  const notesPendingTotal = notesAdvanced.filter(n => !n.reimbursed).reduce((s, n) => s + n.amount, 0)

  const availableRevenues = totalRevenues + reportIn
  const rawBalance = availableRevenues - totalExpenses - netMonthlySavings - reportedOut - notesNetImpact
  const balance = Math.abs(rawBalance) < 0.005 ? 0 : rawBalance
  const totalUsed = totalExpenses + netMonthlySavings + reportedOut + notesNetImpact
  const budgetPercent = availableRevenues > 0 ? Math.min((Math.max(totalUsed, 0) / availableRevenues) * 100, 100) : 0
  const isOverBudget = totalUsed > availableRevenues && availableRevenues > 0

  const arthurSavings = savings.filter(sv => sv.who === 'arthur' && sv.type === 'deposit').reduce((s, sv) => s + sv.amount, 0)
    - savings.filter(sv => sv.who === 'arthur' && sv.type === 'withdrawal').reduce((s, sv) => s + sv.amount, 0)
  const palomaSavings = savings.filter(sv => sv.who === 'paloma' && sv.type === 'deposit').reduce((s, sv) => s + sv.amount, 0)
    - savings.filter(sv => sv.who === 'paloma' && sv.type === 'withdrawal').reduce((s, sv) => s + sv.amount, 0)
  const arthurExpenses = realExpenses.filter(e => e.who === 'arthur').reduce((s, e) => s + e.amount, 0)
  const palomaExpenses = realExpenses.filter(e => e.who === 'paloma').reduce((s, e) => s + e.amount, 0)
  const arthurRevenues = realRevenues.filter(r => r.who === 'arthur').reduce((s, r) => s + r.amount, 0)
  const palomaRevenues = realRevenues.filter(r => r.who === 'paloma').reduce((s, r) => s + r.amount, 0)
  const notesAdvancedArthur = notesAdvanced.filter(n => n.who === 'arthur').reduce((s, n) => s + n.amount, 0)
  const notesAdvancedPaloma = notesAdvanced.filter(n => n.who === 'paloma').reduce((s, n) => s + n.amount, 0)
  const notesReimbursedArthur = notesReimbursedThisMonth.filter(n => n.who === 'arthur').reduce((s, n) => s + n.amount, 0)
  const notesReimbursedPaloma = notesReimbursedThisMonth.filter(n => n.who === 'paloma').reduce((s, n) => s + n.amount, 0)
  const notesImpactArthur = notesAdvancedArthur - notesReimbursedArthur
  const notesImpactPaloma = notesAdvancedPaloma - notesReimbursedPaloma

  const arthurNet = arthurRevenues + reportInArthur - arthurExpenses - arthurSavings - reportedOutArthur - notesImpactArthur
  const palomaNet = palomaRevenues + reportInPaloma - palomaExpenses - palomaSavings - reportedOutPaloma - notesImpactPaloma

  const categoryTotals = CATEGORIES.filter(c => c.value !== 'epargne').map(cat => ({
    ...cat,
    total: realExpenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const recent = realExpenses.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0ms' }}>
        <Link href="/profil" className="flex items-center gap-3 transition-transform active:scale-95 duration-100">
          {firstName === 'Arthur' ? <AvatarArthur size={44} /> : <AvatarPaloma size={44} />}
          <h1 className="text-[22px] font-bold text-black">Bonjour {firstName}</h1>
        </Link>
        <Suspense fallback={null}>
          <MonthSelector />
        </Suspense>
      </div>

      {/* Solde card */}
      <div className="rounded-[20px] bg-[#F7F7F7] p-6 animate-slide-up transition-transform active:scale-[0.98] duration-150"
        style={{ animationDelay: '70ms' }}>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Solde du mois</p>
        <p className="text-[52px] font-bold mt-1 leading-none tracking-[-2px] animate-count-pop"
          style={{ color: balance < 0 ? '#8A8A8A' : '#000000', animationDelay: '200ms' }}>
          {balance >= 0 ? '+' : '-'}<CountUp value={balance} /> €
        </p>
        <p className="text-[13px] text-[#8A8A8A] mt-2">
          {reportedOut > 0.01
            ? `Reporté vers ${outTargetLabel}`
            : reportIn > 0.01
              ? `Dont +${fmt(reportIn)} € reporté du mois précédent`
              : balance >= 0 ? 'Restant après dépenses' : 'Déficit ce mois'}
        </p>
      </div>

      {/* Revenus / Dépenses / Épargne */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '140ms' }}>
        <Link href="/revenus"
          className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px] transition-transform active:scale-[0.96] duration-100">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Revenus</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">+{fmt(totalRevenues)} €</p>
        </Link>
        <Link href="/depenses"
          className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px] transition-transform active:scale-[0.96] duration-100">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Dépenses</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">-{fmt(totalExpenses)} €</p>
        </Link>
        <Link href="/epargne"
          className="rounded-[16px] bg-[#F7F7F7] p-3 flex flex-col justify-between min-h-[90px] transition-transform active:scale-[0.96] duration-100">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Épargne</p>
            <ChevronRight size={12} color="#8A8A8A" />
          </div>
          <p className="text-[16px] font-bold text-black mt-1 leading-tight">
            {netMonthlySavings >= 0 ? '+' : ''}{fmt(netMonthlySavings)} €
          </p>
        </Link>
      </div>

      {/* Budget progress */}
      {totalRevenues > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Revenus utilisés</p>
            <p className="text-[13px] font-semibold text-black">{Math.round(budgetPercent)}%</p>
          </div>
          <AnimatedBar
            percent={budgetPercent}
            color={isOverBudget ? '#C0392B' : '#000000'}
            height={6}
            delay={250}
          />
          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#8A8A8A]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-black" />
              <span>Dépenses</span>
            </div>
            <span className="ml-auto">
              {isOverBudget
                ? `Dépassement ${fmt(totalUsed - totalRevenues)} €`
                : `Reste ${fmt(balance)} €`}
            </span>
          </div>
        </div>
      )}

      {/* Par personne */}
      <div className="animate-slide-up" style={{ animationDelay: '260ms' }}>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Par personne</p>
        <div className="grid grid-cols-2 gap-3">
          <PersonCard name="Arthur" revenues={arthurRevenues} expenses={arthurExpenses} net={arthurNet} isActive />
          <PersonCard name="Paloma" revenues={palomaRevenues} expenses={palomaExpenses} net={palomaNet} />
        </div>
      </div>

      {/* Notes de frais */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <ExpenseNotesCard
          advanced={notesAdvancedTotal}
          reimbursedThisMonth={notesReimbursedTotal}
          pending={notesPendingTotal}
          netImpact={notesNetImpact}
          count={notesAdvanced.length}
        />
      </div>

      {/* Épargne du mois */}
      {netMonthlySavings > 0 && (
        <Link href="/epargne"
          className="rounded-[16px] bg-[#F7F7F7] p-4 flex items-center gap-3 animate-slide-up transition-transform active:scale-[0.97] duration-100"
          style={{ animationDelay: '320ms' }}>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <PiggyBank size={20} color="white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Mis de côté ce mois</p>
            <p className="text-[18px] font-bold text-black leading-tight mt-0.5">{fmt(netMonthlySavings)} €</p>
          </div>
          <ChevronRight size={18} color="#8A8A8A" />
        </Link>
      )}

      {/* Par catégorie */}
      {categoryTotals.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '380ms' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Par catégorie</p>
          <div className="flex flex-col gap-3">
            {categoryTotals.map((cat, i) => (
              <div key={cat.value} className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${400 + i * 45}ms` }}>
                <CategoryIcon category={cat.value} size={18} containerSize={36} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[14px] font-medium text-black">{cat.label}</span>
                    <span className="text-[14px] font-semibold text-black">{fmt(cat.total)} €</span>
                  </div>
                  <AnimatedBar
                    percent={totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0}
                    color="#000"
                    bgColor="#E5E5E5"
                    height={3}
                    delay={450 + i * 45}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Récent */}
      {recent.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '440ms' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-1">Dépenses récentes</p>
          <div className="row-list">
            {recent.map(e => <ExpenseRow key={e.id} expense={e} />)}
          </div>
        </div>
      )}

      {expenses.length === 0 && revenues.length === 0 && savings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <p className="text-[16px] text-[#8A8A8A]">Aucune transaction ce mois</p>
          <p className="text-[13px] text-[#8A8A8A] mt-1">Appuyez sur + pour commencer</p>
        </div>
      )}
    </div>
  )
}

function PersonCard({ name, revenues, expenses, net, isActive = false }: {
  name: string; revenues: number; expenses: number; net: number; isActive?: boolean
}) {
  const f = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (
    <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col gap-2 transition-transform active:scale-[0.97] duration-100">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-black">{name}</p>
        <div className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: isActive ? '#000' : '#E5E5E5' }}>
          <span className="text-[10px] font-bold" style={{ color: isActive ? '#fff' : '#000' }}>
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
      </div>
      <div className="h-px bg-[#E5E5E5] my-1" />
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8A8A8A]">Reste</span>
        <span className="text-[16px] font-bold" style={{ color: net < 0 ? '#C0392B' : '#000' }}>
          {net >= 0 ? '+' : ''}{f(net)} €
        </span>
      </div>
    </div>
  )
}
