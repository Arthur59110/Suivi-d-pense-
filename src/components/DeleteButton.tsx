'use client'
import { useTransition, useState, useRef, useEffect } from 'react'
import { deleteExpense } from '@/lib/actions'
import { MoreVertical } from 'lucide-react'
import Link from 'next/link'

interface Props {
  id: string
  editHref: string
}

export default function DeleteButton({ id, editHref }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleDelete() {
    setOpen(false)
    if (!confirm('Supprimer cette dépense ?')) return
    startTransition(() => deleteExpense(id))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="p-1 disabled:opacity-30"
      >
        <MoreVertical size={16} color="#8A8A8A" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 min-w-[130px] rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden">
          <Link
            href={editHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-[14px] font-medium text-black"
          >
            Modifier
          </Link>
          <div className="h-px bg-[#F0F0F0]" />
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-3 text-[14px] font-medium text-red-500"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
