'use client'
import Link from 'next/link'
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, PiggyBank } from 'lucide-react'

export default function AjouterPage() {
  return (
    <div className="flex flex-col px-5 pt-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Ajouter</h1>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/depenses/new"
          className="rounded-[20px] bg-[#F7F7F7] p-6 flex items-center gap-4"
        >
          <div className="w-[56px] h-[56px] rounded-full bg-black flex items-center justify-center">
            <ArrowDownCircle size={28} color="white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-black">Nouvelle dépense</p>
            <p className="text-[13px] text-[#8A8A8A] mt-0.5">Sortie d&apos;argent</p>
          </div>
        </Link>

        <Link
          href="/revenus/new"
          className="rounded-[20px] bg-[#F7F7F7] p-6 flex items-center gap-4"
        >
          <div className="w-[56px] h-[56px] rounded-full bg-black flex items-center justify-center">
            <ArrowUpCircle size={28} color="white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-black">Nouveau revenu</p>
            <p className="text-[13px] text-[#8A8A8A] mt-0.5">Entrée d&apos;argent</p>
          </div>
        </Link>

        <Link
          href="/epargne/new"
          className="rounded-[20px] bg-[#F7F7F7] p-6 flex items-center gap-4"
        >
          <div className="w-[56px] h-[56px] rounded-full bg-black flex items-center justify-center">
            <PiggyBank size={28} color="white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-black">Mettre de côté</p>
            <p className="text-[13px] text-[#8A8A8A] mt-0.5">Épargne cumulée</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
