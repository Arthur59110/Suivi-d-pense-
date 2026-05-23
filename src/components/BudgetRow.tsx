'use client'
import { useState, useTransition } from 'react'
import { setBudget } from '@/lib/actions'
import CategoryIcon from './CategoryIcon'
import { Check } from 'lucide-react'

interface Props {
  category: string
  label: string
  initial: number
}

export default function BudgetRow({ category, label, initial }: Props) {
  const [value, setValue] = useState(initial > 0 ? String(initial) : '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function commit() {
    const num = parseFloat(value.replace(',', '.')) || 0
    if (num === initial) return
    startTransition(async () => {
      try {
        await setBudget(category, num)
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } catch {
        setValue(initial > 0 ? String(initial) : '')
      }
    })
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <CategoryIcon category={category} size={18} containerSize={40} />
      <span className="flex-1 text-[15px] font-medium text-black">{label}</span>
      <div className="relative flex items-center">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={commit}
          placeholder="—"
          className="w-[100px] rounded-[10px] bg-[#F7F7F7] px-3 py-2.5 text-[15px] font-semibold text-black text-right outline-none placeholder-[#C8C8C8]"
          disabled={isPending}
        />
        <span className="ml-2 text-[14px] font-semibold text-[#8A8A8A] w-3">€</span>
        {saved && (
          <span className="absolute right-12 -top-1 flex items-center justify-center w-4 h-4 rounded-full bg-black">
            <Check size={10} color="white" strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  )
}
