export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { ExpenseNote } from '@/lib/types'
import { ChevronLeft, Plus, Receipt } from 'lucide-react'
import Link from 'next/link'
import ExpenseNoteRow from '@/components/ExpenseNoteRow'
import MonthSelector from '@/components/MonthSelector'
import { Suspense } from 'react'
import { format, parseISO, endOfMonth } from 'date-fns'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function NotesFraisPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const supabase = await getSupabaseServer()

  const selectedDate = monthParam ? parseISO(`${monthParam}-01`) : new Date()
  const startDate = format(selectedDate, 'yyyy-MM-01')
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd')

  const [advancedRes, reimbursedRes, allPendingRes] = await Promise.all([
    supabase.from('expense_notes').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('expense_notes').select('*').gte('reimbursed_date', startDate).lte('reimbursed_date', endDate).order('reimbursed_date', { ascending: false }),
    supabase.from('expense_notes').select('*').eq('reimbursed', false).order('date', { ascending: false }),
  ])

  const advanced: ExpenseNote[] = (advancedRes.data as ExpenseNote[] | null) ?? []
  const reimbursedThisMonth: ExpenseNote[] = (reimbursedRes.data as ExpenseNote[] | null) ?? []
  const allPending: ExpenseNote[] = (allPendingRes.data as ExpenseNote[] | null) ?? []

  const advancedTotal = advanced.reduce((s, n) => s + n.amount, 0)
  const reimbursedTotal = reimbursedThisMonth.reduce((s, n) => s + n.amount, 0)
  const allPendingTotal = allPending.reduce((s, n) => s + n.amount, 0)
  const netImpact = advancedTotal - reimbursedTotal

  // Notes affichées : avancées ce mois + remboursées ce mois (dédupliquées)
  const idsAdvanced = new Set(advanced.map(n => n.id))
  const reimbursedNotInAdvanced = reimbursedThisMonth.filter(n => !idsAdvanced.has(n.id))
  const allDisplayed = [...advanced, ...reimbursedNotInAdvanced]

  return (
    <div className="flex flex-col gap-5 pt-6">
      {/* Header */}
      <div className="px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} color="#000" />
          </Link>
          <h1 className="text-[22px] font-bold text-black">Notes de frais</h1>
        </div>
        <Link
          href="/notes-frais/nouveau"
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
        >
          <Plus size={20} color="white" />
        </Link>
      </div>

      {/* Sélecteur de mois */}
      <div className="px-5 flex justify-center">
        <Suspense fallback={null}>
          <MonthSelector />
        </Suspense>
      </div>

      {/* Carte récap */}
      <div className="px-5">
        <div className="rounded-[20px] bg-[#F7F7F7] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
            Impact net ce mois
          </p>
          <p
            className="text-[36px] font-bold mt-1 leading-none tracking-[-1px]"
            style={{ color: netImpact > 0 ? '#C0392B' : '#000' }}
          >
            {netImpact >= 0 ? '-' : '+'}{fmt(Math.abs(netImpact))} €
          </p>
          <p className="text-[12px] text-[#8A8A8A] mt-2">
            sur le solde du mois
          </p>
          <div className="flex gap-3 mt-4 pt-4 border-t border-[#E8E8E8]">
            <div className="flex-1">
              <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Avancées</p>
              <p className="text-[15px] font-semibold text-black mt-0.5">-{fmt(advancedTotal)} €</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Remboursées</p>
              <p className="text-[15px] font-semibold text-black mt-0.5">+{fmt(reimbursedTotal)} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* En attente toutes périodes */}
      {allPendingTotal > 0 && (
        <div className="px-5">
          <div className="rounded-[16px] border border-[#E0E0E0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center">
              <Receipt size={18} color="#C0392B" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">
                Total en attente de remboursement
              </p>
              <p className="text-[18px] font-bold text-black leading-tight mt-0.5">
                {fmt(allPendingTotal)} €
              </p>
            </div>
            <span className="text-[12px] font-semibold text-[#8A8A8A]">
              {allPending.length} note{allPending.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="px-5 pb-8">
        {allDisplayed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[16px] text-[#8A8A8A]">Aucune note ce mois</p>
            <p className="text-[13px] text-[#8A8A8A] mt-1">Appuyez sur + pour en ajouter une</p>
          </div>
        ) : (
          <div className="row-list">
            {allDisplayed.map(n => <ExpenseNoteRow key={n.id} note={n} />)}
          </div>
        )}
      </div>
    </div>
  )
}
