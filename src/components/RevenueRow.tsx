import type { Revenue } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteRevenueButton from './DeleteRevenueButton'
import { ArrowUp } from 'lucide-react'

export default function RevenueRow({ revenue }: { revenue: Revenue }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
      <div className="w-[42px] h-[42px] rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
        <ArrowUp size={18} color="#000" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-black leading-tight truncate">
          {revenue.description || 'Revenu'}
        </p>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">
          {format(parseISO(revenue.date), 'd MMM yyyy', { locale: fr })}
        </p>
      </div>
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: revenue.who === 'arthur' ? '#000000' : '#E5E5E5' }}
      >
        <span
          className="text-[10px] font-bold"
          style={{ color: revenue.who === 'arthur' ? '#ffffff' : '#000000' }}
        >
          {revenue.who === 'arthur' ? 'A' : 'P'}
        </span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[15px] font-semibold text-black">
          +{revenue.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </p>
      </div>
      <DeleteRevenueButton id={revenue.id} editHref={`/revenus/${revenue.id}/edit`} />
    </div>
  )
}
