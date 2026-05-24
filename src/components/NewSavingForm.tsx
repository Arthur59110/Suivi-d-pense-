'use client'
import { useState, useTransition } from 'react'
import { createSaving } from '@/lib/actions'
import { ChevronLeft, ArrowDown } from 'lucide-react'
import Link from 'next/link'

export default function NewSavingPage() {
  const [amount, setAmount] = useState('')
  const [who, setWho] = useState<'arthur' | 'paloma'>('arthur')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }

    startTransition(async () => {
      try {
        await createSaving({ amount: numAmount, description, who, date })
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
        <Link href="/epargne" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Mettre de côté</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Montant */}
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full placeholder-[#E5E5E5]"
            style={{ maxWidth: 240 }}
          />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        {/* Source du revenu */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Retiré du revenu de
          </p>
          <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
            {(['arthur', 'paloma'] as const).map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setWho(w)}
                className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
                style={{
                  background: who === w ? '#ffffff' : 'transparent',
                  color: who === w ? '#000000' : '#8A8A8A',
                  boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {w === 'arthur' ? 'Arthur' : 'Paloma'}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-2 px-1">
            <ArrowDown size={13} color="#8A8A8A" className="mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-[#8A8A8A] leading-snug">
              Ce montant sera déduit du salaire de {who === 'arthur' ? 'Arthur' : 'Paloma'} ce mois-ci
              et cumulé dans l&apos;épargne.
            </p>
          </div>
        </div>

        {/* Description */}
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex. : Épargne Mai, Vacances d'été…"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
        />

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
        />

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40 transition-opacity"
        >
          {isPending ? 'Enregistrement...' : 'Mettre de côté'}
        </button>
      </form>
    </div>
  )
}
