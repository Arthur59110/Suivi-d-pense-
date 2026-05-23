'use client'

import { useTransition } from 'react'
import { deleteExpense } from '@/lib/actions'

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
      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 transition-colors"
    >
      {isPending ? '...' : 'Supprimer'}
    </button>
  )
}
