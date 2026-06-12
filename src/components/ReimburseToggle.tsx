'use client'
import { useState, useTransition } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { markExpenseNoteReimbursed, unmarkExpenseNoteReimbursed } from '@/lib/actions'

export default function ReimburseToggle({
  id,
  reimbursed,
}: {
  id: string
  reimbursed: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  function handleMark(date: string) {
    setShowDatePicker(false)
    startTransition(() => markExpenseNoteReimbursed(id, date))
  }

  function handleUnmark() {
    startTransition(() => unmarkExpenseNoteReimbursed(id))
  }

  if (reimbursed) {
    return (
      <button
        type="button"
        onClick={handleUnmark}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-semibold disabled:opacity-50"
      >
        <Check size={12} strokeWidth={3} />
        Remboursée
      </button>
    )
  }

  if (showDatePicker) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          defaultValue={today}
          onBlur={e => handleMark(e.target.value)}
          autoFocus
          className="rounded-[8px] bg-[#F0F0F0] px-2 py-1 text-[11px] outline-none"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowDatePicker(true)}
      disabled={isPending}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E0E0E0] text-[#8A8A8A] text-[11px] font-semibold disabled:opacity-50 active:bg-[#F7F7F7]"
    >
      <RotateCcw size={11} />
      Marquer remboursée
    </button>
  )
}
