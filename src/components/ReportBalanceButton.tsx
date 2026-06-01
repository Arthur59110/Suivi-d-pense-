'use client'
import { useTransition, useRef, useState } from 'react'
import { reportBalance } from '@/lib/actions'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ReportBalanceButton({
  sourceMonthStr,
  arthurAmount,
  palomaAmount,
  prevMonthStr,
  prevMonthLabel,
  nextMonthStr,
  nextMonthLabel,
}: {
  sourceMonthStr: string
  arthurAmount: number
  palomaAmount: number
  prevMonthStr: string
  prevMonthLabel: string
  nextMonthStr: string
  nextMonthLabel: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)
  const total = arthurAmount + palomaAmount

  function transfer(targetMonthStr: string) {
    if (submittingRef.current) return
    submittingRef.current = true
    setError(null)
    startTransition(async () => {
      try {
        await reportBalance(sourceMonthStr, arthurAmount, palomaAmount, targetMonthStr)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) { throw err }
        setError(msg)
      } finally {
        submittingRef.current = false
      }
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 h-[44px] rounded-[12px] bg-[#F7F7F7] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A] flex-shrink-0">Reporter</span>
        <span className="text-[15px] font-bold text-black flex-1 text-center">
          +{total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </span>
        <button
          onClick={() => transfer(prevMonthStr)}
          disabled={isPending}
          className="flex items-center gap-1 px-2.5 h-[30px] rounded-[8px] bg-white border border-[#E0E0E0] text-[12px] font-semibold text-black disabled:opacity-40 active:scale-95 transition-transform duration-100 flex-shrink-0"
        >
          {isPending
            ? <div className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
            : <><ChevronLeft size={13} strokeWidth={2.5} /><span>{prevMonthLabel}</span></>
          }
        </button>
        <button
          onClick={() => transfer(nextMonthStr)}
          disabled={isPending}
          className="flex items-center gap-1 px-2.5 h-[30px] rounded-[8px] bg-black text-white text-[12px] font-semibold disabled:opacity-40 active:scale-95 transition-transform duration-100 flex-shrink-0"
        >
          {isPending
            ? <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <><span>{nextMonthLabel}</span><ChevronRight size={13} strokeWidth={2.5} /></>
          }
        </button>
      </div>
      {error && <p className="text-[12px] text-red-500 px-1">{error}</p>}
    </div>
  )
}
