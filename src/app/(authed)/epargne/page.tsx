export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import { format, parseISO, isSameMonth, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Plus, PiggyBank } from 'lucide-react'
import SavingRow from '@/components/SavingRow'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function EpargnePage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('savings')
    .select('*')
    .order('date', { ascending: false })

  const savings: Saving[] = (data as Saving[] | null) ?? []

  const totalArthur = savings.filter(s => s.who === 'arthur').reduce((sum, s) => sum + s.amount, 0)
  const totalPaloma = savings.filter(s => s.who === 'paloma').reduce((sum, s) => sum + s.amount, 0)
  const totalCumule = totalArthur + totalPaloma

  const arthurPct = totalCumule > 0 ? (totalArthur / totalCumule) * 100 : 50
  const palomaPct = totalCumule > 0 ? (totalPaloma / totalCumule) * 100 : 50

  const oldestDate =
    savings.length > 0
      ? parseISO(savings[savings.length - 1].date)
      : new Date()
  const newestDate = savings.length > 0 ? parseISO(savings[0].date) : new Date()

  const months =
    savings.length > 0
      ? eachMonthOfInterval({ start: oldestDate, end: newestDate }).reverse().slice(0, 6).reverse()
      : []

  const monthlyTotals = months.map(m => ({
    label: format(m, 'MMM', { locale: fr }),
    total: savings
      .filter(s => isSameMonth(parseISO(s.date), m))
      .reduce((sum, s) => sum + s.amount, 0),
  }))
  const maxMonthly = Math.max(...monthlyTotals.map(m => m.total), 1)

  return (
    <div className="flex flex-col pt-4 px-5 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <PiggyBank size={20} color="white" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-bold text-black">Épargne</h1>
        </div>
        <Link
          href="/epargne/new"
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
        >
          <Plus size={20} color="white" />
        </Link>
      </div>

      {savings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <PiggyBank size={48} color="#E5E5E5" strokeWidth={1} />
          <p className="text-[16px] text-[#8A8A8A]">Aucune épargne enregistrée</p>
          <p className="text-[13px] text-[#8A8A8A]">
            Mettez de l'argent de côté chaque mois
          </p>
          <Link
            href="/epargne/new"
            className="mt-2 px-5 py-2.5 rounded-full bg-black text-white text-[14px] font-semibold"
          >
            Commencer à épargner
          </Link>
        </div>
      ) : (
        <>
          {/* Total cumulé */}
          <div className="rounded-[20px] bg-[#F7F7F7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
              Total épargné
            </p>
            <p className="text-[52px] font-bold mt-1 leading-none tracking-[-2px] text-black">
              {formatAmount(totalCumule)} €
            </p>
            <p className="text-[13px] text-[#8A8A8A] mt-2">
              Cumulé depuis{' '}
              {format(oldestDate, 'MMMM yyyy', { locale: fr })}
            </p>
          </div>

          {/* Arthur / Paloma */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
              Répartition
            </p>
            <div className="rounded-[16px] bg-[#F7F7F7] p-4">
              <div className="flex items-center h-10 rounded-[10px] overflow-hidden gap-0.5">
                {totalArthur > 0 && (
                  <div
                    className="h-full bg-black flex items-center justify-center"
                    style={{ width: `${arthurPct}%` }}
                  >
                    {arthurPct >= 18 && (
                      <span className="text-[11px] font-semibold text-white">
                        {Math.round(arthurPct)}%
                      </span>
                    )}
                  </div>
                )}
                {totalPaloma > 0 && (
                  <div
                    className="h-full bg-[#D4D4D4] flex items-center justify-center"
                    style={{ width: `${palomaPct}%` }}
                  >
                    {palomaPct >= 18 && (
                      <span className="text-[11px] font-semibold text-black">
                        {Math.round(palomaPct)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                    <p className="text-[12px] text-[#8A8A8A]">Arthur</p>
                  </div>
                  <p className="text-[20px] font-bold text-black mt-1">
                    {formatAmount(totalArthur)} €
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4D4D4]" />
                    <p className="text-[12px] text-[#8A8A8A]">Paloma</p>
                  </div>
                  <p className="text-[20px] font-bold text-black mt-1">
                    {formatAmount(totalPaloma)} €
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Évolution mensuelle */}
          {monthlyTotals.length > 1 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
                Épargne par mois
              </p>
              <div className="flex items-end justify-between gap-2 h-[100px]">
                {monthlyTotals.map((m, i) => {
                  const height = (m.total / maxMonthly) * 100
                  const isMost = m.total === maxMonthly && m.total > 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-[5px]"
                          style={{
                            height: `${Math.max(height, 3)}%`,
                            background: isMost ? '#000000' : '#E5E5E5',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-[#8A8A8A] capitalize">{m.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historique */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
              Historique
            </p>
            <div>
              {savings.map(s => (
                <SavingRow key={s.id} saving={s} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
