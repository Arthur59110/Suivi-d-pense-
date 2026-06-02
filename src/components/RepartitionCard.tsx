'use client'
import { useState } from 'react'
import type { Expense } from '@/lib/types'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function RepartitionCard({ expenses, title = 'Répartition' }: { expenses: Expense[]; title?: string }) {
  const [split, setSplit] = useState<'all' | 'commune' | 'perso'>('all')

  const splitExpenses =
    split === 'commune' ? expenses.filter(e => !e.is_personal)
    : split === 'perso' ? expenses.filter(e => e.is_personal)
    : expenses
  const splitTotal = splitExpenses.reduce((s, e) => s + e.amount, 0)
  const arthurTotal = splitExpenses.filter(e => e.who === 'arthur').reduce((s, e) => s + e.amount, 0)
  const palomaTotal = splitExpenses.filter(e => e.who === 'paloma').reduce((s, e) => s + e.amount, 0)
  const arthurPct = splitTotal > 0 ? (arthurTotal / splitTotal) * 100 : 0
  const palomaPct = splitTotal > 0 ? (palomaTotal / splitTotal) * 100 : 50

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">{title}</p>
      <div className="rounded-[16px] bg-[#F7F7F7] p-4">
        <div className="rounded-[10px] bg-white p-1 flex gap-1 mb-4">
          {([
            { val: 'all', label: 'Toutes' },
            { val: 'commune', label: 'Communes' },
            { val: 'perso', label: 'Perso.' },
          ] as const).map(({ val, label }) => {
            const active = split === val
            return (
              <button
                key={val}
                type="button"
                onClick={() => setSplit(val)}
                className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold text-center transition-all"
                style={{
                  background: active ? '#000' : 'transparent',
                  color: active ? '#fff' : '#8A8A8A',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        {splitTotal > 0 ? (
          <>
            <div className="flex items-center gap-2 h-10 rounded-[10px] overflow-hidden">
              <div
                className="h-full bg-black flex items-center justify-center"
                style={{ width: `${Math.max(arthurPct, 4)}%`, minWidth: arthurPct > 0 ? 30 : 0 }}
              >
                {arthurPct >= 15 && (
                  <span className="text-[11px] font-semibold text-white">{Math.round(arthurPct)}%</span>
                )}
              </div>
              <div
                className="h-full bg-[#D4D4D4] flex items-center justify-center"
                style={{ width: `${Math.max(palomaPct, 4)}%`, minWidth: palomaPct > 0 ? 30 : 0 }}
              >
                {palomaPct >= 15 && (
                  <span className="text-[11px] font-semibold text-black">{Math.round(palomaPct)}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  <p className="text-[12px] text-[#8A8A8A]">Arthur</p>
                </div>
                <p className="text-[16px] font-bold text-black mt-1">{formatAmount(arthurTotal)} €</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4D4D4]" />
                  <p className="text-[12px] text-[#8A8A8A]">Paloma</p>
                </div>
                <p className="text-[16px] font-bold text-black mt-1">{formatAmount(palomaTotal)} €</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[#8A8A8A] text-center py-2">Aucune dépense dans cette catégorie</p>
        )}
      </div>
    </div>
  )
}
