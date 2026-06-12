import Link from 'next/link'
import { Receipt, ChevronRight } from 'lucide-react'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ExpenseNotesCard({
  advanced,
  reimbursedThisMonth,
  pending,
  netImpact,
  count,
}: {
  advanced: number
  reimbursedThisMonth: number
  pending: number
  netImpact: number
  count: number
}) {
  const isEmpty = count === 0 && reimbursedThisMonth === 0

  if (isEmpty) {
    return (
      <Link
        href="/notes-frais"
        className="block rounded-[16px] bg-[#F7F7F7] p-4 transition-transform active:scale-[0.97] duration-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center">
            <Receipt size={20} color="#8A8A8A" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Notes de frais</p>
            <p className="text-[13px] text-[#8A8A8A] mt-0.5">Avances pro à rembourser</p>
          </div>
          <ChevronRight size={18} color="#8A8A8A" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/notes-frais"
      className="block rounded-[16px] bg-[#F7F7F7] p-4 transition-transform active:scale-[0.97] duration-100"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
          <Receipt size={20} color="white" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#8A8A8A]">Notes de frais</p>
          <p className="text-[18px] font-bold text-black leading-tight mt-0.5">
            {netImpact >= 0 ? '-' : '+'}{fmt(Math.abs(netImpact))} € <span className="text-[12px] font-normal text-[#8A8A8A]">net</span>
          </p>
        </div>
        <ChevronRight size={18} color="#8A8A8A" />
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-[#E8E8E8] text-[11px]">
        <div>
          <p className="text-[#8A8A8A] uppercase tracking-[0.5px]">Avancées</p>
          <p className="text-black font-semibold text-[13px] mt-0.5">{fmt(advanced)} €</p>
        </div>
        <div>
          <p className="text-[#8A8A8A] uppercase tracking-[0.5px]">Remboursées</p>
          <p className="text-black font-semibold text-[13px] mt-0.5">{fmt(reimbursedThisMonth)} €</p>
        </div>
        {pending > 0 && (
          <div className="ml-auto text-right">
            <p className="text-[#8A8A8A] uppercase tracking-[0.5px]">En attente</p>
            <p className="font-semibold text-[13px] mt-0.5" style={{ color: '#C0392B' }}>{fmt(pending)} €</p>
          </div>
        )}
      </div>
      {count > 0 && (
        <p className="text-[11px] text-[#8A8A8A] mt-2">
          {count} note{count > 1 ? 's' : ''} ce mois
        </p>
      )}
    </Link>
  )
}
