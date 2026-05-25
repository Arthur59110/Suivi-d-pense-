'use client'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

interface Props {
  open: boolean
  onClose: () => void
  editHref: string
  onDelete: () => void
  deleteLabel?: string
}

export default function ActionSheet({ open, onClose, editHref, onDelete, deleteLabel = 'Supprimer' }: Props) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-[24px] px-4 pt-3 pb-8 flex flex-col gap-0 animate-slide-up">
        <div className="w-10 h-1 rounded-full bg-[#E0E0E0] mx-auto mb-5" />
        <Link
          href={editHref}
          onClick={onClose}
          className="py-4 text-[17px] font-medium text-black text-center border-b border-[#F0F0F0] active:bg-[#F7F7F7] rounded-[4px] transition-colors"
        >
          Modifier
        </Link>
        <button
          onClick={onDelete}
          className="py-4 text-[17px] font-medium text-red-500 text-center active:bg-[#FFF5F5] rounded-[4px] transition-colors"
        >
          {deleteLabel}
        </button>
        <button
          onClick={onClose}
          className="mt-3 py-4 text-[17px] font-semibold text-[#8A8A8A] text-center bg-[#F7F7F7] rounded-[14px] active:bg-[#EDEDED] transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>,
    document.body
  )
}
