'use client'
import { useTransition, useState } from 'react'
import { Receipt, MoreVertical } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ExpenseNote } from '@/lib/types'
import { deleteExpenseNote } from '@/lib/actions'
import ActionSheet from './ActionSheet'
import ReimburseToggle from './ReimburseToggle'

export default function ExpenseNoteRow({ note }: { note: ExpenseNote }) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  function handleDelete() {
    setOpen(false)
    startTransition(() => deleteExpenseNote(note.id))
  }

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-[#F0F0F0]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
          <Receipt size={16} color="#000" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-black leading-tight truncate">
            {note.description || 'Note de frais'}
          </p>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5">
            Avancée le {format(parseISO(note.date), 'd MMM', { locale: fr })}
            {note.reimbursed && note.reimbursed_date && (
              <> · Remb. le {format(parseISO(note.reimbursed_date), 'd MMM', { locale: fr })}</>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-semibold text-black">
            {note.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="p-1">
          <MoreVertical size={16} color="#8A8A8A" />
        </button>
      </div>
      <div className="pl-12">
        <ReimburseToggle id={note.id} reimbursed={note.reimbursed} />
      </div>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        editHref={`/notes-frais/${note.id}/edit`}
        onDelete={handleDelete}
        deleteLabel="Supprimer la note"
      />
    </div>
  )
}
