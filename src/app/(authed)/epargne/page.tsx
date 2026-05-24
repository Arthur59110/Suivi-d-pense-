export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Saving } from '@/lib/types'
import { format, parseISO, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Plus, Minus, PiggyBank } from 'lucide-react'
import SavingRow from '@/components/SavingRow'
import PinGate from '@/components/PinGate'
import SavingsChart from '@/components/SavingsChart'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtChange(n: number) {
  const abs = Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n >= 0 ? `+${abs} €` : `-${abs} €`
}

interface AccountGroup {
  account_name: string
  who: 'arthur' | 'paloma'
  balance: number
  monthlyChange: number
}

function groupAccounts(savings: Saving[], now: Date): AccountGroup[] {
  const map = new Map<string, AccountGroup>()
  for (const s of savings) {
    const key = `${s.who}::${s.account_name}`
    if (!map.has(key)) {
      map.set(key, { account_name: s.account_name, who: s.who, balance: 0, monthlyChange: 0 })
    }
    const acc = map.get(key)!
    const delta = s.type === 'withdrawal' ? -s.amount : s.amount
    acc.balance += delta
    if (isSameMonth(parseISO(s.date), now)) acc.monthlyChange += delta
  }
  return Array.from(map.values())
}

export default async function EpargnePage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase
    .from('savings')
    .select('*')
    .order('date', { ascending: false })

  const savings: Saving[] = (data as Saving[] | null) ?? []

  const now = new Date()
  const accounts = groupAccounts(savings, now)
  const arthurAccounts = accounts.filter(a => a.who === 'arthur')
  const palomaAccounts = accounts.filter(a => a.who === 'paloma')

  const arthurBalance = arthurAccounts.reduce((s, a) => s + a.balance, 0)
  const palomaBalance = palomaAccounts.reduce((s, a) => s + a.balance, 0)
  const totalBalance = arthurBalance + palomaBalance

  const monthlyChange = savings
    .filter(s => isSameMonth(parseISO(s.date), now))
    .reduce((sum, s) => sum + (s.type === 'withdrawal' ? -s.amount : s.amount), 0)

  const showAllocation = totalBalance > 0 && arthurBalance >= 0 && palomaBalance >= 0
  const arthurPct = showAllocation ? Math.round((arthurBalance / totalBalance) * 100) : 50
  const palomaPct = 100 - arthurPct

  const sortedAsc = [...savings].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  const chartPoints = sortedAsc.map(s => {
    running += s.type === 'withdrawal' ? -s.amount : s.amount
    return { date: s.date, value: running }
  })

  const oldestDate = savings.length > 0 ? parseISO(savings[savings.length - 1].date) : null

  return (
    <PinGate>
      <div className="flex flex-col pt-5 px-5 gap-6 pb-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
              Épargne totale
            </p>
            <p className="text-[44px] font-bold leading-none mt-1 tracking-[-1.5px]"
              style={{ color: totalBalance < 0 ? '#C0392B' : '#000' }}>
              {fmt(totalBalance)} €
            </p>
            {savings.length > 0 && monthlyChange !== 0 && (
              <p className="text-[13px] font-semibold mt-1.5"
                style={{ color: monthlyChange >= 0 ? '#1A7A4A' : '#C0392B' }}>
                {fmtChange(monthlyChange)} ce mois
              </p>
            )}
            {savings.length > 0 && monthlyChange === 0 && oldestDate && (
              <p className="text-[12px] text-[#8A8A8A] mt-1.5">
                Depuis {format(oldestDate, 'MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            <Link href="/epargne/new?type=withdrawal"
              className="w-[40px] h-[40px] rounded-full bg-[#F7F7F7] flex items-center justify-center">
              <Minus size={18} color="#8A8A8A" />
            </Link>
            <Link href="/epargne/new?type=deposit"
              className="w-[40px] h-[40px] rounded-full bg-black flex items-center justify-center">
              <Plus size={18} color="white" />
            </Link>
          </div>
        </div>

        {savings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <PiggyBank size={48} color="#E5E5E5" strokeWidth={1} />
            <p className="text-[16px] text-[#8A8A8A]">Aucune épargne enregistrée</p>
            <Link href="/epargne/new"
              className="mt-2 px-5 py-2.5 rounded-full bg-black text-white text-[14px] font-semibold">
              Commencer à épargner
            </Link>
          </div>
        ) : (
          <>
            {/* Répartition */}
            {showAllocation && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
                  Répartition
                </p>
                <div className="h-[6px] rounded-full overflow-hidden flex">
                  <div className="bg-black rounded-l-full" style={{ width: `${arthurPct}%` }} />
                  <div className="bg-[#C8C8C8] rounded-r-full" style={{ width: `${palomaPct}%` }} />
                </div>
                <div className="flex justify-between mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    <span className="text-[12px] text-[#8A8A8A]">Arthur — {arthurPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#C8C8C8]" />
                    <span className="text-[12px] text-[#8A8A8A]">Paloma — {palomaPct}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Évolution */}
            {chartPoints.length >= 2 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">
                  Évolution
                </p>
                <SavingsChart points={chartPoints} />
              </div>
            )}

            {/* Arthur's accounts */}
            {arthurAccounts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">A</span>
                    </div>
                    <p className="text-[13px] font-semibold text-black">Arthur</p>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: arthurBalance < 0 ? '#C0392B' : '#000' }}>
                    {fmt(arthurBalance)} €
                  </p>
                </div>
                <div className="rounded-[18px] bg-[#F7F7F7] overflow-hidden">
                  {arthurAccounts.map((acc, i) => (
                    <div key={acc.account_name}>
                      {i > 0 && <div className="h-[1px] bg-[#ECECEC] mx-4" />}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-black truncate">{acc.account_name}</p>
                          {acc.monthlyChange !== 0 && (
                            <p className="text-[12px] font-medium"
                              style={{ color: acc.monthlyChange >= 0 ? '#1A7A4A' : '#C0392B' }}>
                              {fmtChange(acc.monthlyChange)} ce mois
                            </p>
                          )}
                        </div>
                        <p className="text-[17px] font-bold flex-shrink-0"
                          style={{ color: acc.balance < 0 ? '#C0392B' : '#000' }}>
                          {fmt(acc.balance)} €
                        </p>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Link
                            href={`/epargne/new?who=arthur&type=deposit&account=${encodeURIComponent(acc.account_name)}`}
                            className="w-[30px] h-[30px] rounded-full bg-black flex items-center justify-center">
                            <Plus size={13} color="white" />
                          </Link>
                          <Link
                            href={`/epargne/new?who=arthur&type=withdrawal&account=${encodeURIComponent(acc.account_name)}`}
                            className="w-[30px] h-[30px] rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
                            <Minus size={13} color="#8A8A8A" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/epargne/new?who=arthur&type=deposit"
                  className="mt-2 flex items-center gap-1.5 px-1 py-2">
                  <Plus size={13} color="#8A8A8A" />
                  <span className="text-[13px] text-[#8A8A8A]">Nouveau compte</span>
                </Link>
              </div>
            )}

            {/* Paloma's accounts */}
            {palomaAccounts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E5E5E5] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black">P</span>
                    </div>
                    <p className="text-[13px] font-semibold text-black">Paloma</p>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: palomaBalance < 0 ? '#C0392B' : '#000' }}>
                    {fmt(palomaBalance)} €
                  </p>
                </div>
                <div className="rounded-[18px] bg-[#F7F7F7] overflow-hidden">
                  {palomaAccounts.map((acc, i) => (
                    <div key={acc.account_name}>
                      {i > 0 && <div className="h-[1px] bg-[#ECECEC] mx-4" />}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-black truncate">{acc.account_name}</p>
                          {acc.monthlyChange !== 0 && (
                            <p className="text-[12px] font-medium"
                              style={{ color: acc.monthlyChange >= 0 ? '#1A7A4A' : '#C0392B' }}>
                              {fmtChange(acc.monthlyChange)} ce mois
                            </p>
                          )}
                        </div>
                        <p className="text-[17px] font-bold flex-shrink-0"
                          style={{ color: acc.balance < 0 ? '#C0392B' : '#000' }}>
                          {fmt(acc.balance)} €
                        </p>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Link
                            href={`/epargne/new?who=paloma&type=deposit&account=${encodeURIComponent(acc.account_name)}`}
                            className="w-[30px] h-[30px] rounded-full bg-black flex items-center justify-center">
                            <Plus size={13} color="white" />
                          </Link>
                          <Link
                            href={`/epargne/new?who=paloma&type=withdrawal&account=${encodeURIComponent(acc.account_name)}`}
                            className="w-[30px] h-[30px] rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
                            <Minus size={13} color="#8A8A8A" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/epargne/new?who=paloma&type=deposit"
                  className="mt-2 flex items-center gap-1.5 px-1 py-2">
                  <Plus size={13} color="#8A8A8A" />
                  <span className="text-[13px] text-[#8A8A8A]">Nouveau compte</span>
                </Link>
              </div>
            )}

            {/* Bouton si aucun compte encore */}
            {arthurAccounts.length === 0 && (
              <Link href="/epargne/new?who=arthur&type=deposit"
                className="flex items-center gap-1.5 px-1 py-2">
                <Plus size={13} color="#8A8A8A" />
                <span className="text-[13px] text-[#8A8A8A]">Ajouter un compte Arthur</span>
              </Link>
            )}
            {palomaAccounts.length === 0 && (
              <Link href="/epargne/new?who=paloma&type=deposit"
                className="flex items-center gap-1.5 px-1 py-2">
                <Plus size={13} color="#8A8A8A" />
                <span className="text-[13px] text-[#8A8A8A]">Ajouter un compte Paloma</span>
              </Link>
            )}

            {/* Activité récente */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
                Activité récente
              </p>
              <div>
                {savings.slice(0, 20).map(s => (
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
