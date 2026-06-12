export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { ExpenseNote } from '@/lib/types'
import { ChevronLeft, Receipt } from 'lucide-react'
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

  const [notesByDateRes, advReimbRes, allPendingRes] = await Promise.all([
    // Notes créées ce mois (avances ET remboursements directs)
    supabase.from('expense_notes').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    // Avances remboursées ce mois (reimbursed_date in range)
    supabase.from('expense_notes').select('*').eq('type', 'advance').eq('reimbursed', true).gte('reimbursed_date', startDate).lte('reimbursed_date', endDate).order('reimbursed_date', { ascending: false }),
    // Toutes les avances non remboursées (toutes périodes)
    supabase.from('expense_notes').select('*').eq('type', 'advance').eq('reimbursed', false).order('date', { ascending: false }),
  ])

  const notesByDate: ExpenseNote[] = notesByDateRes.error ? [] : ((notesByDateRes.data as ExpenseNote[] | null) ?? [])
  const advReimb: ExpenseNote[] = advReimbRes.error ? [] : ((advReimbRes.data as ExpenseNote[] | null) ?? [])
  const allPending: ExpenseNote[] = allPendingRes.error ? [] : ((allPendingRes.data as ExpenseNote[] | null) ?? [])

  // Calculs
  const advancedThisMonth = notesByDate.filter(n => n.type === 'advance')
  const directReimbThisMonth = notesByDate.filter(n => n.type === 'reimbursement')
  const advancedTotal = advancedThisMonth.reduce((s, n) => s + n.amount, 0)
  const advReimbTotal = advReimb.reduce((s, n) => s + n.amount, 0)
  const directReimbTotal = directReimbThisMonth.reduce((s, n) => s + n.amount, 0)
  const reimbursedTotal = advReimbTotal + directReimbTotal
  const netImpact = advancedTotal - reimbursedTotal
  const allPendingTotal = allPending.reduce((s, n) => s + n.amount, 0)

  // Notes affichées ce mois : avances créées ce mois + avances remboursées ce mois (si pas déjà dans notesByDate) + remboursements directs
  const idsInByDate = new Set(notesByDate.map(n => n.id))
  const extraReimb = advReimb.filter(n => !idsInByDate.has(n.id))
  const allDisplayed = [...notesByDate, ...extraReimb]
    .sort((a, b) => {
      const da = a.type === 'advance' && a.reimbursed && a.reimbursed_date ? a.reimbursed_date : a.date
      const db = b.type === 'advance' && b.reimbursed && b.reimbursed_date ? b.reimbursed_date : b.date
      return db.localeCompare(da)
    })

  return (
    <div className="flex flex-col gap-5 pt-6">
      {/* Header — sans bouton "+", le BottomNav le gère */}
      <div className="px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} color="#000" />
          </Link>
          <h1 className="text-[22px] font-bold text-black">Notes de frais</h1>
        </div>
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
          <p className="text-[12px] text-[#8A8A8A] mt-2">sur le solde du mois</p>
          {(advancedTotal > 0 || reimbursedTotal > 0) && (
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
          )}
        </div>
      </div>

      {/* Alerte total en attente (toutes périodes) */}
      {allPendingTotal > 0 && (
        <div className="px-5">
          <div className="rounded-[16px] border border-[#E0E0E0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center">
              <Receipt size={18} color="#C0392B" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">
                En attente de remboursement
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
