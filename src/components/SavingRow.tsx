import type { Saving } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PiggyBank, ArrowUp } from 'lucide-react'
import DeleteSavingButton from './DeleteSavingButton'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SavingRow({ saving }: { saving: Saving }) {
  const isWithdrawal = saving.type === 'withdrawal'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: isWithdrawal ? '#FFF0F0' : '#F7F7F7' }}
      >
        {isWithdrawal
          ? <ArrowUp size={17} color="#C0392B" strokeWidth={2} />
          : <PiggyBank size={18} color="#000" strokeWidth={1.5} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-black leading-tight truncate">
          {saving.description || (isWithdrawal ? 'Retrait épargne' : 'Épargne')}
        </p>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">
          {format(parseISO(saving.date), 'd MMM yyyy', { locale: fr })}
        </p>
      </div>
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: saving.who === 'arthur' ? '#000000' : '#E5E5E5' }}
      >
        <span
          className="text-[10px] font-bold"
          style={{ color: saving.who === 'arthur' ? '#ffffff' : '#000000' }}
        >
          {saving.who === 'arthur' ? 'A' : 'P'}
        </span>
      </div>
      <p
        className="text-[15px] font-semibold flex-shrink-0"
        style={{ color: isWithdrawal ? '#C0392B' : '#000' }}
      >
        {isWithdrawal ? '-' : '+'}{formatAmount(saving.amount)} €
      </p>
      <DeleteSavingButton id={saving.id} editHref={`/epargne/${saving.id}/edit`} />
    </div>
  )
}
