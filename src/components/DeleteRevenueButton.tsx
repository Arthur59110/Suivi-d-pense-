'use client'
import { useTransition } from 'react'
import { deleteRevenue } from '@/lib/actions'
import { MoreVertical } from 'lucide-react'

export default function DeleteRevenueButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  function handleDelete() {
    if (!confirm('Supprimer ce revenu ?')) return
    startTransition(() => deleteRevenue(id))
  }
  return (
    <button onClick={handleDelete} disabled={isPending} className="p-1 disabled:opacity-30">
      <MoreVertical size={16} color="#8A8A8A" />
    </button>
  )
}
