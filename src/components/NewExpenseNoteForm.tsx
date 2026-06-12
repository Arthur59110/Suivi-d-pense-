'use client'
import { useState, useTransition, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createExpenseNote } from '@/lib/actions'

export default function NewExpenseNoteForm() {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState<'advance' | 'reimbursement'>('advance')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const submittingRef = useRef(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) {
      submittingRef.current = false
      setError('Montant invalide')
      return
    }
    startTransition(async () => {
      try {
        await createExpenseNote({ amount: numAmount, description, who: 'paloma', type, date })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
        setError(msg)
      } finally {
        submittingRef.current = false
      }
    })
  }

  const isReimb = type === 'reimbursement'

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/notes-frais" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Note de frais</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Toggle Frais / Remboursement */}
        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          {([
            { val: 'advance', label: 'Frais avancé' },
            { val: 'reimbursement', label: 'Remboursement' },
          ] as const).map(({ val, label }) => (
            <button key={val} type="button" onClick={() => setType(val)}
              className="flex-1 py-3 rounded-[10px] text-[14px] font-semibold transition-all"
              style={{
                background: type === val ? '#000' : 'transparent',
                color: type === val ? '#fff' : '#8A8A8A',
                boxShadow: type === val ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input
            type="number" step="0.01" min="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full placeholder-[#E5E5E5]"
            style={{ maxWidth: 240 }}
          />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={isReimb ? 'Description (ex. Remb. notes octobre)' : 'Description (ex. Déjeuner client)'}
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
        />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            {isReimb ? 'Date du remboursement' : "Date de l'avance"}
          </p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
          />
        </div>

        <div className="rounded-[12px] bg-[#F7F7F7] p-4">
          <p className="text-[12px] text-[#8A8A8A] leading-snug">
            {isReimb
              ? "Ce remboursement sera ajouté au solde du mois. Il n'apparaît ni dans les dépenses ni dans les revenus."
              : "Ce frais sera déduit du solde du mois jusqu'au remboursement. Il n'apparaît ni dans les dépenses ni dans les revenus."}
          </p>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40"
        >
          {isPending ? 'Enregistrement…' : isReimb ? 'Enregistrer le remboursement' : "Enregistrer le frais"}
        </button>
      </form>
    </div>
  )
}
