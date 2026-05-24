'use client'
import { useState, useTransition } from 'react'
import { createExpense } from '@/lib/actions'
import { CATEGORIES } from '@/lib/types'
import CategoryIcon from '@/components/CategoryIcon'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewExpensePage() {
  const [amount, setAmount] = useState('')
  const [who, setWho] = useState<'arthur' | 'paloma'>('arthur')
  const [isPersonal, setIsPersonal] = useState(false)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount.replace(',', '.'))
    if (!numAmount || numAmount <= 0) { setError('Montant invalide'); return }
    if (!category) { setError('Sélectionnez une catégorie'); return }

    startTransition(async () => {
      try {
        await createExpense({ amount: numAmount, description, category, who, is_personal: isPersonal, date })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
        setError(msg)
      }
    })
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] px-5 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Nouvelle dépense</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Big amount input */}
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

        {/* Who toggle */}
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

        {/* Commune / Personnelle toggle */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-2">Type</p>
          <div className="rounded-[12px] bg-[#F7F7F7] p-1 flex">
            <button
              type="button"
              onClick={() => setIsPersonal(false)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
              style={{
                background: !isPersonal ? '#ffffff' : 'transparent',
                color: !isPersonal ? '#000000' : '#8A8A8A',
                boxShadow: !isPersonal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Commune
            </button>
            <button
              type="button"
              onClick={() => setIsPersonal(true)}
              className="flex-1 py-3 rounded-[10px] text-[15px] font-semibold transition-all"
              style={{
                background: isPersonal ? '#ffffff' : 'transparent',
                color: isPersonal ? '#000000' : '#8A8A8A',
                boxShadow: isPersonal ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Personnelle
            </button>
          </div>
          {isPersonal && (
            <p className="text-[12px] text-[#8A8A8A] mt-2 px-1">
              Cette dépense n&apos;entre pas dans l&apos;analyse commune du couple.
            </p>
          )}
        </div>

        {/* Category grid */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-3">Catégorie</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="flex flex-col items-center gap-1.5 rounded-[12px] py-3 px-1 transition-all"
                style={{
                  background: category === cat.value ? '#000000' : '#F7F7F7',
                }}
              >
                <CategoryIcon
                  category={cat.value}
                  size={20}
                  containerSize={36}
                  inverted={category === cat.value}
                />
                <span
                  className="text-[10px] font-medium leading-tight text-center"
                  style={{ color: category === cat.value ? '#ffffff' : '#8A8A8A' }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-auto h-[56px] rounded-[14px] bg-black text-white text-[16px] font-semibold disabled:opacity-40 transition-opacity"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
