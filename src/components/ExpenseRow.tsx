import CategoryIcon from './CategoryIcon'
import { CATEGORIES } from '@/lib/types'
import type { Expense } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeleteButton from './DeleteButton'

interface Props {
  expense: Expense
}

export default function ExpenseRow({ expense }: Props) {
  const cat = CATEGORIES.find(c => c.value === expense.category)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
      <CategoryIcon category={expense.category} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-black leading-tight truncate">
          {expense.description || cat?.label || expense.category}
        </p>
        <p className="text-[12px] text-[#8A8A8A] mt-0.5">{cat?.label}</p>
      </div>
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: expense.who === 'arthur' ? '#000000' : '#E5E5E5',
        }}
      >
        <span
          className="text-[10px] font-bold"
          style={{ color: expense.who === 'arthur' ? '#ffffff' : '#000000' }}
        >
          {expense.who === 'arthur' ? 'A' : 'P'}
        </span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[15px] font-semibold text-black">
          {expense.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </p>
        <p className="text-[11px] text-[#8A8A8A]">
          {format(new Date(expense.date), 'd MMM', { locale: fr })}
        </p>
      </div>
      <DeleteButton id={expense.id} />
    </div>
  )
}
