'use client'
import { useTransition } from 'react'
import { deleteExpense } from '@/lib/actions'
import { MoreVertical } from 'lucide-react'

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Supprimer cette dépense ?')) return
    startTransition(() => deleteExpense(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 disabled:opacity-30"
    >
      <MoreVertical size={16} color="#8A8A8A" />
    </button>
  )
}
