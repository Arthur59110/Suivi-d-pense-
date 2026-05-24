'use client'
import { useState, useTransition } from 'react'
import { updateRevenue } from '@/lib/actions'
import type { Revenue } from '@/lib/types'
import { REVENUE_SOURCES } from '@/lib/types'
import RevenueIcon from '@/components/RevenueIcon'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, addMonths, parseISO, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

function getBudgetMonth(date: string, useNext: boolean): string {
  const d = parseISO(date)
  const base = useNext ? addMonths(startOfMonth(d), 1) : startOfMonth(d)
  return format(base, 'yyyy-MM-dd')
}

function monthLabel(date: string, useNext: boolean): string {
  const d = parseISO(date)
  const base = useNext ? addMonths(startOfMonth(d), 1) : startOfMonth(d)
  return format(base, 'MMMM yyyy', { locale: fr })
}

export default function EditRevenueForm({ revenue }: { revenue: Revenue }) {
  const [amount, setAmount] = useState(String(revenue.amount))
  const [who, setWho] = useState<'arthur' | 'paloma'>(revenue.who ?? 'arthur')
  const [source, setSource] = useState(revenue.source)
  const [description, setDescription] = useState(revenue.description ?? '')
  const [date, setDate] = useState(revenue.date)

  // Detect if existing revenue was already assigned to next month
  const initialUseNext = revenue.budget_month
    ? !isSameMonth(parseISO(revenue.budget_month), parseISO(revenue.date))
    : false
  const [useNext, setUseNext] = useState(initialUseNext)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }
    const budget_month = getBudgetMonth(date, useNext)
    startTransition(async () => {
      try {
        await updateRevenue(revenue.id, { amount: numAmount, description, source, who, date, budget_month })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
        setError(msg)
      }
    })
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/revenus" className="p-1"><ChevronLeft size={24} color="#000" /></Link>
        <h1 className="text-[28px] font-bold text-black">Modifier le revenu</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input type="number" step="0.01" min="0" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full"
            style={{ maxWidth: 240 }} />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          {(['arthur', 'paloma'] as const).map(w => (
            <button key={w} type="button" onClick={() => setWho(w)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold"
              style={{ background: who === w ? '#ffffff' : 'transparent', color: who === w ? '#000000' : '#8A8A8A', boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {w === 'arthur' ? 'Arthur' : 'Paloma'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {REVENUE_SOURCES.map(src => (
            <button key={src.value} type="button" onClick={() => setSource(src.value)}
              className="flex flex-col items-center gap-1.5 rounded-[12px] py-3 px-1"
              style={{ background: source === src.value ? '#000000' : '#F7F7F7' }}>
              <RevenueIcon source={src.value} size={20} containerSize={36} inverted={source === src.value} />
              <span className="text-[10px] font-medium" style={{ color: source === src.value ? '#ffffff' : '#8A8A8A' }}>
                {src.label}
              </span>
            </button>
          ))}
        </div>

        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none" />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Date de réception
          </p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Compte pour le mois de
          </p>
          <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
            <button type="button" onClick={() => setUseNext(false)}
              className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold transition-all capitalize"
              style={{ background: !useNext ? '#ffffff' : 'transparent', color: !useNext ? '#000000' : '#8A8A8A', boxShadow: !useNext ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {monthLabel(date, false)}
            </button>
            <button type="button" onClick={() => setUseNext(true)}
              className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold transition-all capitalize"
              style={{ background: useNext ? '#ffffff' : 'transparent', color: useNext ? '#000000' : '#8A8A8A', boxShadow: useNext ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {monthLabel(date, true)}
            </button>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button type="submit" disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40">
          {isPending ? 'Enregistrement...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}
