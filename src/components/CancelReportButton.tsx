'use client'
import { useTransition } from 'react'
import { cancelReport } from '@/lib/actions'
import { X } from 'lucide-react'

export default function CancelReportButton({
  ids,
  label,
}: {
  ids: string[]
  label: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await cancelReport(ids)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('NEXT_REDIRECT')) throw err
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-[16px] border-2 border-[#F0F0F0] p-4 flex items-center gap-3 transition-all active:scale-[0.97] active:border-[#C0392B] duration-100 disabled:opacity-40"
    >
      <div className="flex-1 text-left">
        <p className="text-[14px] font-semibold" style={{ color: '#C0392B' }}>Annuler le report</p>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">{label}</p>
      </div>
      {isPending ? (
        <div className="w-5 h-5 rounded-full border-2 border-[#C0392B] border-t-transparent animate-spin flex-shrink-0" />
      ) : (
        <X size={18} color="#C0392B" strokeWidth={2} className="flex-shrink-0" />
      )}
    </button>
  )
}
