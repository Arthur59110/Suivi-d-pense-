'use client'
import { useTransition } from 'react'
import type { Saving } from '@/lib/types'
import { deleteSaving } from '@/lib/actions'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PiggyBank, Trash2 } from 'lucide-react'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SavingRow({ saving }: { saving: Saving }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Supprimer cette épargne ?')) return
    startTransition(() => deleteSaving(saving.id))
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0]">
      <div className="w-9 h-9 rounded-[10px] bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
        <PiggyBank size={18} color="#000" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-black leading-tight truncate">
          {saving.description || 'Épargne'}
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
      <p className="text-[15px] font-semibold text-black flex-shrink-0">
        +{formatAmount(saving.amount)} €
      </p>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1 disabled:opacity-30 flex-shrink-0"
      >
        <Trash2 size={15} color="#8A8A8A" />
      </button>
    </div>
  )
}
