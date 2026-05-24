import RevenueIcon from './RevenueIcon'
import { REVENUE_SOURCES } from '@/lib/types'
import type { Revenue } from '@/lib/types'
import { format, parseISO, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteRevenueButton from './DeleteRevenueButton'

export default function RevenueRow({ revenue }: { revenue: Revenue }) {
  const src = REVENUE_SOURCES.find(s => s.value === revenue.source)
  const isDeferred = revenue.budget_month &&
    !isSameMonth(parseISO(revenue.budget_month), parseISO(revenue.date))
  const deferredLabel = isDeferred
    ? format(parseISO(revenue.budget_month!), 'MMM', { locale: fr })
    : null

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
      <RevenueIcon source={revenue.source} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-medium text-black leading-tight truncate">
            {revenue.description || src?.label || revenue.source}
          </p>
          {deferredLabel && (
            <span className="flex-shrink-0 text-[10px] font-semibold text-[#8A8A8A] bg-[#F0F0F0] px-1.5 py-0.5 rounded-[6px] capitalize">
              → {deferredLabel}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">{src?.label}</p>
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
        <p className="text-[11px] text-[#8A8A8A]">
          {format(new Date(revenue.date), 'd MMM', { locale: fr })}
        </p>
      </div>
      <DeleteRevenueButton id={revenue.id} editHref={`/revenus/${revenue.id}/edit`} />
    </div>
  )
}
