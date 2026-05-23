'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MonthSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthParam = searchParams.get('month')
  const currentDate = monthParam ? parseISO(`${monthParam}-01`) : new Date()

  const label = format(currentDate, 'MMMM yyyy', { locale: fr })
  const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1)

  function navigate(direction: 'prev' | 'next') {
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    const newMonth = format(newDate, 'yyyy-MM')
    router.push(`?month=${newMonth}`)
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => navigate('prev')} className="p-1">
        <ChevronLeft size={18} color="#8A8A8A" />
      </button>
      <span className="text-[14px] font-medium text-black">{labelCapitalized}</span>
      <button onClick={() => navigate('next')} className="p-1">
        <ChevronRight size={18} color="#8A8A8A" />
      </button>
    </div>
  )
}
