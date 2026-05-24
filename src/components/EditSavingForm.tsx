'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateSaving } from '@/lib/actions'
import type { Saving } from '@/lib/types'
import { ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'

export default function EditSavingForm({ saving }: { saving: Saving }) {
  const router = useRouter()

  useEffect(() => {
    if (sessionStorage.getItem('epg') !== '1') router.replace('/epargne')
  }, [router])

  const [type, setType] = useState<'deposit' | 'withdrawal'>(saving.type ?? 'deposit')
  const [amount, setAmount] = useState(String(saving.amount))
  const [who, setWho] = useState<'arthur' | 'paloma'>(saving.who ?? 'arthur')
  const [description, setDescription] = useState(saving.description ?? '')
  const [date, setDate] = useState(saving.date)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isWithdrawal = type === 'withdrawal'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }
    startTransition(async () => {
      try {
        await updateSaving(saving.id, { amount: numAmount, description, who, type, date })
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
        <Link href="/epargne" className="p-1"><ChevronLeft size={24} color="#000" /></Link>
        <h1 className="text-[28px] font-bold text-black">Modifier</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Type */}
        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          <button type="button" onClick={() => setType('deposit')}
            className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
            style={{ background: !isWithdrawal ? '#ffffff' : 'transparent', color: !isWithdrawal ? '#000' : '#8A8A8A', boxShadow: !isWithdrawal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            Mettre de côté
          </button>
          <button type="button" onClick={() => setType('withdrawal')}
            className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
            style={{ background: isWithdrawal ? '#ffffff' : 'transparent', color: isWithdrawal ? '#000' : '#8A8A8A', boxShadow: isWithdrawal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
            Retirer
          </button>
        </div>

        {/* Amount */}
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2"
          style={{ borderColor: isWithdrawal ? '#8A8A8A' : '#000' }}>
          <input type="number" step="0.01" min="0.01" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="text-[56px] font-bold bg-transparent outline-none text-center w-full"
            style={{ maxWidth: 240, color: isWithdrawal ? '#8A8A8A' : '#000' }} />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        {/* Who */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            {isWithdrawal ? "De l'épargne de" : 'Retiré du revenu de'}
          </p>
          <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
            {(['arthur', 'paloma'] as const).map(w => (
              <button key={w} type="button" onClick={() => setWho(w)}
                className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold"
                style={{ background: who === w ? '#ffffff' : 'transparent', color: who === w ? '#000' : '#8A8A8A', boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {w === 'arthur' ? 'Arthur' : 'Paloma'}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-2 px-1">
            {isWithdrawal
              ? <ArrowUp size={13} color="#8A8A8A" className="mt-0.5 flex-shrink-0" />
              : <ArrowDown size={13} color="#8A8A8A" className="mt-0.5 flex-shrink-0" />
            }
            <p className="text-[12px] text-[#8A8A8A] leading-snug">
              {isWithdrawal
                ? `Retiré du solde d'épargne de ${who === 'arthur' ? 'Arthur' : 'Paloma'}.`
                : `Déduit du salaire de ${who === 'arthur' ? 'Arthur' : 'Paloma'} sur le mois choisi.`
              }
            </p>
          </div>
        </div>

        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none" />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button type="submit" disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] text-white text-[16px] font-semibold disabled:opacity-40"
          style={{ background: isWithdrawal ? '#8A8A8A' : '#000' }}>
          {isPending ? 'Enregistrement...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}
