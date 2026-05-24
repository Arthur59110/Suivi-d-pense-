'use client'
import { useTransition } from 'react'
import { reportBalance } from '@/lib/actions'
import { ArrowRight } from 'lucide-react'

export default function ReportBalanceButton({
  currentMonth,
  arthurAmount,
  palomaAmount,
  nextMonthLabel,
}: {
  currentMonth: string
  arthurAmount: number
  palomaAmount: number
  nextMonthLabel: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await reportBalance(currentMonth, arthurAmount, palomaAmount)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
      }
    })
  }

  const total = arthurAmount + palomaAmount

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-[16px] border-2 border-[#E5E5E5] p-4 flex items-center gap-3 transition-all active:scale-[0.97] active:border-black duration-100 disabled:opacity-40"
    >
      <div className="flex-1 text-left">
        <p className="text-[14px] font-semibold text-black">Reporter au mois suivant</p>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">
          +{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € → {nextMonthLabel}
        </p>
      </div>
      {isPending ? (
        <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin flex-shrink-0" />
      ) : (
        <ArrowRight size={18} color="#8A8A8A" strokeWidth={2} className="flex-shrink-0" />
      )}
    </button>
  )
}
