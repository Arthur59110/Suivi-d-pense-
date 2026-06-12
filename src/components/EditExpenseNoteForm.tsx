'use client'
import { useState, useTransition, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { updateExpenseNote } from '@/lib/actions'
import type { ExpenseNote } from '@/lib/types'

export default function EditExpenseNoteForm({ note }: { note: ExpenseNote }) {
  const [amount, setAmount] = useState(String(note.amount).replace('.', ','))
  const [description, setDescription] = useState(note.description ?? '')
  const [date, setDate] = useState(note.date)
  const [who, setWho] = useState<'arthur' | 'paloma'>(note.who)
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
        await updateExpenseNote(note.id, { amount: numAmount, description, who, type: note.type, date })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
        setError(msg)
      } finally {
        submittingRef.current = false
      }
    })
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/notes-frais" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Modifier la note</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex items-baseline justify-center gap-2 py-4 border-b-2 border-black">
          <input
            type="number" step="0.01" min="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            className="text-[56px] font-bold text-black bg-transparent outline-none text-center w-full"
            style={{ maxWidth: 240 }}
          />
          <span className="text-[28px] font-bold text-[#8A8A8A]">€</span>
        </div>

        <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
          {(['arthur', 'paloma'] as const).map(w => (
            <button key={w} type="button" onClick={() => setWho(w)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
              style={{
                background: who === w ? '#ffffff' : 'transparent',
                color: who === w ? '#000000' : '#8A8A8A',
                boxShadow: who === w ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
              {w === 'arthur' ? 'Arthur' : 'Paloma'}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          className="rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black placeholder-[#8A8A8A] outline-none"
        />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">
            Date de l&apos;avance
          </p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-[12px] bg-[#F7F7F7] px-4 py-4 text-[16px] text-black outline-none"
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
