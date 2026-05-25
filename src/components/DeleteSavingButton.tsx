'use client'
import { useTransition, useState } from 'react'
import { deleteSaving } from '@/lib/actions'
import { MoreVertical } from 'lucide-react'
import ActionSheet from './ActionSheet'

interface Props {
  id: string
  editHref: string
}

export default function DeleteSavingButton({ id, editHref }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setOpen(false)
    startTransition(() => deleteSaving(id))
  }

  return (
    <>
      <button onClick={() => setOpen(true)} disabled={isPending} className="p-1 disabled:opacity-30">
        <MoreVertical size={16} color="#8A8A8A" />
      </button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        editHref={editHref}
        onDelete={handleDelete}
        deleteLabel="Supprimer l'épargne"
      />
    </>
  )
}
