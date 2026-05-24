export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import { format, parseISO, isSameMonth, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Plus, Minus, PiggyBank } from 'lucide-react'
import SavingRow from '@/components/SavingRow'
import PinGate from '@/components/PinGate'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function balance(savings: Saving[], who: 'arthur' | 'paloma') {
  return savings
    .filter(s => s.who === who)
    .reduce((sum, s) => sum + (s.type === 'withdrawal' ? -s.amount : s.amount), 0)
}

export default async function EpargnePage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('savings')
    .select('*')
    .order('date', { ascending: false })

  const savings: Saving[] = (data as Saving[] | null) ?? []

  const arthurBalance = balance(savings, 'arthur')
  const palomaBalance = balance(savings, 'paloma')
  const totalBalance = arthurBalance + palomaBalance

  const arthurDeposits = savings.filter(s => s.who === 'arthur' && s.type === 'deposit').reduce((s, e) => s + e.amount, 0)
  const palomaDeposits = savings.filter(s => s.who === 'paloma' && s.type === 'deposit').reduce((s, e) => s + e.amount, 0)
  const arthurWithdrawals = savings.filter(s => s.who === 'arthur' && s.type === 'withdrawal').reduce((s, e) => s + e.amount, 0)
  const palomaWithdrawals = savings.filter(s => s.who === 'paloma' && s.type === 'withdrawal').reduce((s, e) => s + e.amount, 0)

  const depositSavings = savings.filter(s => s.type === 'deposit')
  const oldestDeposit = depositSavings.length > 0 ? parseISO(depositSavings[depositSavings.length - 1].date) : new Date()
  const newestDeposit = depositSavings.length > 0 ? parseISO(depositSavings[0].date) : new Date()

  const months = depositSavings.length > 0
    ? eachMonthOfInterval({ start: oldestDeposit, end: newestDeposit }).reverse().slice(0, 6).reverse()
    : []

  const monthlyTotals = months.map(m => ({
    label: format(m, 'MMM', { locale: fr }),
    deposits: savings.filter(s => s.type === 'deposit' && isSameMonth(parseISO(s.date), m)).reduce((sum, s) => sum + s.amount, 0),
    withdrawals: savings.filter(s => s.type === 'withdrawal' && isSameMonth(parseISO(s.date), m)).reduce((sum, s) => sum + s.amount, 0),
  }))
  const maxMonthly = Math.max(...monthlyTotals.map(m => m.deposits), 1)

  return (
    <PinGate>
    <div className="flex flex-col pt-4 px-5 gap-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <PiggyBank size={20} color="white" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-bold text-black">Épargne</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/epargne/new?type=withdrawal"
            className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[#F7F7F7]"
          >
            <Minus size={20} color="#8A8A8A" />
          </Link>
          <Link
            href="/epargne/new?type=deposit"
            className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black"
          >
            <Plus size={20} color="white" />
          </Link>
        </div>
      </div>

      {savings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <PiggyBank size={48} color="#E5E5E5" strokeWidth={1} />
          <p className="text-[16px] text-[#8A8A8A]">Aucune épargne enregistrée</p>
          <Link
            href="/epargne/new"
            className="mt-2 px-5 py-2.5 rounded-full bg-black text-white text-[14px] font-semibold"
          >
            Commencer à épargner
          </Link>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="rounded-[20px] bg-[#F7F7F7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
              Solde total épargne
            </p>
            <p className="text-[52px] font-bold mt-1 leading-none tracking-[-2px]"
              style={{ color: totalBalance < 0 ? '#C0392B' : '#000' }}>
              {fmt(totalBalance)} €
            </p>
            {depositSavings.length > 0 && (
              <p className="text-[13px] text-[#8A8A8A] mt-2">
                Depuis {format(oldestDeposit, 'MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>

          {/* Cards Arthur / Paloma */}
          <div className="grid grid-cols-2 gap-3">
            {/* Arthur */}
            <div className="rounded-[18px] bg-[#F7F7F7] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white">A</span>
                </div>
                <p className="text-[14px] font-semibold text-black">Arthur</p>
              </div>
              <div>
                <p className="text-[24px] font-bold leading-tight"
                  style={{ color: arthurBalance < 0 ? '#C0392B' : '#000' }}>
                  {fmt(arthurBalance)} €
                </p>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <p className="text-[11px] text-[#8A8A8A]">
                    Déposé : +{fmt(arthurDeposits)} €
                  </p>
                  {arthurWithdrawals > 0 && (
                    <p className="text-[11px] text-[#C0392B]">
                      Retiré : -{fmt(arthurWithdrawals)} €
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 mt-auto">
                <Link
                  href="/epargne/new?who=arthur&type=deposit"
                  className="flex-1 h-[34px] rounded-[10px] bg-black flex items-center justify-center"
                >
                  <Plus size={15} color="white" />
                </Link>
                <Link
                  href="/epargne/new?who=arthur&type=withdrawal"
                  className="flex-1 h-[34px] rounded-[10px] bg-white border border-[#E5E5E5] flex items-center justify-center"
                >
                  <Minus size={15} color="#8A8A8A" />
                </Link>
              </div>
            </div>

            {/* Paloma */}
            <div className="rounded-[18px] bg-[#F7F7F7] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E5E5E5] flex items-center justify-center">
                  <span className="text-[11px] font-bold text-black">P</span>
                </div>
                <p className="text-[14px] font-semibold text-black">Paloma</p>
              </div>
              <div>
                <p className="text-[24px] font-bold leading-tight"
                  style={{ color: palomaBalance < 0 ? '#C0392B' : '#000' }}>
                  {fmt(palomaBalance)} €
                </p>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <p className="text-[11px] text-[#8A8A8A]">
                    Déposé : +{fmt(palomaDeposits)} €
                  </p>
                  {palomaWithdrawals > 0 && (
                    <p className="text-[11px] text-[#C0392B]">
                      Retiré : -{fmt(palomaWithdrawals)} €
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 mt-auto">
                <Link
                  href="/epargne/new?who=paloma&type=deposit"
                  className="flex-1 h-[34px] rounded-[10px] bg-black flex items-center justify-center"
                >
                  <Plus size={15} color="white" />
                </Link>
                <Link
                  href="/epargne/new?who=paloma&type=withdrawal"
                  className="flex-1 h-[34px] rounded-[10px] bg-white border border-[#E5E5E5] flex items-center justify-center"
                >
                  <Minus size={15} color="#8A8A8A" />
                </Link>
              </div>
            </div>
          </div>

          {/* Évolution mensuelle */}
          {monthlyTotals.length > 1 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
                Dépôts par mois
              </p>
              <div className="flex items-end justify-between gap-2 h-[100px]">
                {monthlyTotals.map((m, i) => {
                  const height = (m.deposits / maxMonthly) * 100
                  const isMost = m.deposits === maxMonthly && m.deposits > 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-[5px]"
                          style={{ height: `${Math.max(height, 3)}%`, background: isMost ? '#000' : '#E5E5E5' }}
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
    </PinGate>
  )
}
