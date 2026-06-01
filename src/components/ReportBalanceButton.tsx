'use client'
import { useTransition, useRef } from 'react'
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
  const submittingRef = useRef(false)
  const total = arthurAmount + palomaAmount

  function transfer(targetMonthStr: string) {
    if (submittingRef.current) return
    submittingRef.current = true
    startTransition(async () => {
      try {
        await reportBalance(sourceMonthStr, arthurAmount, palomaAmount, targetMonthStr)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
      } finally {
        submittingRef.current = false
      }
    })
  }

  return (
    <div className="rounded-[16px] bg-[#F7F7F7] p-4 flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Reporter le solde restant</p>
        <p className="text-[24px] font-bold text-black mt-1 leading-none">
          +{total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => transfer(prevMonthStr)}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-[12px] bg-white border border-[#E5E5E5] text-[14px] font-semibold text-black disabled:opacity-40 transition-all active:scale-[0.97] duration-100"
        >
          {isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
          ) : (
            <>
              <ChevronLeft size={16} strokeWidth={2.5} />
              <span>{prevMonthLabel}</span>
            </>
          )}
        </button>
        <button
          onClick={() => transfer(nextMonthStr)}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-[12px] bg-black text-white text-[14px] font-semibold disabled:opacity-40 transition-all active:scale-[0.97] duration-100"
        >
          {isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <span>{nextMonthLabel}</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
