export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { ExpenseNote } from '@/lib/types'
import { ChevronLeft, Receipt, ArrowDownLeft } from 'lucide-react'
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

  const [notesByDateRes, allPendingRes] = await Promise.all([
    supabase.from('expense_notes').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
    supabase.from('expense_notes').select('*').eq('type', 'advance').eq('reimbursed', false).order('date', { ascending: false }),
  ])

  const notesByDate: ExpenseNote[] = notesByDateRes.error ? [] : ((notesByDateRes.data as ExpenseNote[] | null) ?? [])
  const allPending: ExpenseNote[] = allPendingRes.error ? [] : ((allPendingRes.data as ExpenseNote[] | null) ?? [])

  const advancedThisMonth = notesByDate.filter(n => n.type === 'advance')
  const directReimbThisMonth = notesByDate.filter(n => n.type === 'reimbursement')
  // Un remboursement d'avance est rattaché au mois de l'avance : on compte les
  // avances de ce mois qui sont remboursées, quel que soit le mois du remboursement.
  const advReimb = advancedThisMonth.filter(n => n.reimbursed)
  const advancedTotal = advancedThisMonth.reduce((s, n) => s + n.amount, 0)
  const advReimbTotal = advReimb.reduce((s, n) => s + n.amount, 0)
  const directReimbTotal = directReimbThisMonth.reduce((s, n) => s + n.amount, 0)
  const reimbursedTotal = advReimbTotal + directReimbTotal
  const netImpact = advancedTotal - reimbursedTotal
  const allPendingTotal = allPending.reduce((s, n) => s + n.amount, 0)

  const allDisplayed = notesByDate.slice().sort((a, b) => b.date.localeCompare(a.date))

  const monthQuery = monthParam ? `?month=${monthParam}` : ''

  return (
    <div className="flex flex-col gap-5 pt-6 pb-28">
      {/* Header */}
      <div className="px-5 flex items-center gap-2">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[22px] font-bold text-black">Notes de frais</h1>
      </div>

      {/* Sélecteur de mois */}
      <div className="px-5 flex justify-center">
        <Suspense fallback={null}>
          <MonthSelector />
        </Suspense>
      </div>

      {/* Deux boutons d'action — toujours visibles */}
      <div className="px-5 grid grid-cols-2 gap-3">
        <Link
          href={`/notes-frais/nouveau?type=advance${monthParam ? `&month=${monthParam}` : ''}`}
          className="rounded-[20px] bg-black p-5 flex flex-col gap-3 transition-transform active:scale-[0.96] duration-100"
        >
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
            <Receipt size={20} color="white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white leading-tight">Frais avancé</p>
            <p className="text-[11px] text-white/60 mt-0.5">Déduit du solde</p>
          </div>
        </Link>
        <Link
          href={`/notes-frais/nouveau?type=reimbursement${monthParam ? `&month=${monthParam}` : ''}`}
          className="rounded-[20px] bg-[#F7F7F7] p-5 flex flex-col gap-3 transition-transform active:scale-[0.96] duration-100"
        >
          <div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center">
            <ArrowDownLeft size={20} color="#000" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-black leading-tight">Remboursement</p>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">Ajouté au solde</p>
          </div>
        </Link>
      </div>

      {/* Carte récap solde */}
      {(advancedTotal > 0 || reimbursedTotal > 0) && (
        <div className="px-5">
          <div className="rounded-[20px] bg-[#F7F7F7] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
              Impact net ce mois
            </p>
            <p
              className="text-[36px] font-bold mt-1 leading-none tracking-[-1px]"
              style={{ color: netImpact > 0 ? '#C0392B' : '#166534' }}
            >
              {netImpact >= 0 ? '-' : '+'}{fmt(Math.abs(netImpact))} €
            </p>
            <p className="text-[12px] text-[#8A8A8A] mt-1">
              Sur le solde de Paloma et le solde du mois
            </p>
            <div className="flex gap-3 mt-4 pt-4 border-t border-[#E8E8E8]">
              {advancedTotal > 0 && (
                <div className="flex-1">
                  <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Avancées</p>
                  <p className="text-[15px] font-semibold text-black mt-0.5">-{fmt(advancedTotal)} €</p>
                </div>
              )}
              {reimbursedTotal > 0 && (
                <div className="flex-1">
                  <p className="text-[10px] text-[#8A8A8A] uppercase tracking-[0.5px]">Remboursées</p>
                  <p className="text-[15px] font-semibold text-black mt-0.5">+{fmt(reimbursedTotal)} €</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerte total en attente */}
      {allPendingTotal > 0 && (
        <div className="px-5">
          <div className="rounded-[16px] border border-[#E0E0E0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF5F0] flex items-center justify-center flex-shrink-0">
              <Receipt size={18} color="#C0392B" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">
                En attente de remboursement
              </p>
              <p className="text-[18px] font-bold text-black leading-tight mt-0.5">
                {fmt(allPendingTotal)} €
              </p>
            </div>
            <span className="text-[12px] font-semibold text-[#8A8A8A] flex-shrink-0">
              {allPending.length} note{allPending.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="px-5">
        {allDisplayed.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[15px] text-[#8A8A8A]">Aucune note ce mois</p>
            <p className="text-[13px] text-[#8A8A8A] mt-1">Utilisez les boutons ci-dessus pour en ajouter une</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
              Ce mois
            </p>
            <div className="row-list">
              {allDisplayed.map(n => <ExpenseNoteRow key={n.id} note={n} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
