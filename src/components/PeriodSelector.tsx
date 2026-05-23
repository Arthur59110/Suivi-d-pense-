'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  mode: 'mois' | 'annee'
}

export default function PeriodSelector({ mode }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const periodParam = searchParams.get('period')
  const now = new Date()

  let label: string
  let prevPeriod: string
  let nextPeriod: string

  if (mode === 'annee') {
    const year = periodParam ? parseInt(periodParam, 10) : now.getFullYear()
    label = String(year)
    prevPeriod = String(year - 1)
    nextPeriod = String(year + 1)
  } else {
    const date = periodParam ? parseISO(`${periodParam}-01`) : now
    const rawLabel = format(date, 'MMMM yyyy', { locale: fr })
    label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)
    prevPeriod = format(subMonths(date, 1), 'yyyy-MM')
    nextPeriod = format(addMonths(date, 1), 'yyyy-MM')
  }

  function navigate(target: string) {
    const params = new URLSearchParams(searchParams)
    params.set('period', target)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-4 py-1">
      <button onClick={() => navigate(prevPeriod)} className="p-1">
        <ChevronLeft size={20} color="#8A8A8A" />
      </button>
      <span className="text-[15px] font-semibold text-black min-w-[140px] text-center">{label}</span>
      <button onClick={() => navigate(nextPeriod)} className="p-1">
        <ChevronRight size={20} color="#8A8A8A" />
      </button>
    </div>
  )
}
