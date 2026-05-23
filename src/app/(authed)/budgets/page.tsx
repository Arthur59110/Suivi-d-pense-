export const dynamic = 'force-dynamic'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Budget } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import BudgetRow from '@/components/BudgetRow'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

function formatAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function BudgetsPage() {
  const supabase = await getSupabaseServer()
  const { data } = await supabase.from('budgets').select('*')
  const budgets: Budget[] = (data as Budget[] | null) ?? []
  const byCategory = new Map(budgets.map(b => [b.category, Number(b.amount)]))
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0)

  return (
    <div className="flex flex-col px-5 pt-4 gap-6">
      <div className="flex items-center gap-3">
        <Link href="/analyse" className="p-1">
          <ChevronLeft size={24} color="#000" />
        </Link>
        <h1 className="text-[28px] font-bold text-black">Budgets</h1>
      </div>

      <div className="rounded-[20px] bg-[#F7F7F7] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">
          Budget mensuel total
        </p>
        <p className="text-[36px] font-bold text-black mt-1 leading-none tracking-[-1px]">
          {formatAmount(totalBudget)} €
        </p>
        <p className="text-[12px] text-[#8A8A8A] mt-2 leading-snug">
          Définissez un montant maximum par catégorie. Laissez vide ou à 0 pour
          retirer le budget. Sauvegarde automatique.
        </p>
      </div>

      <div className="flex flex-col">
        {CATEGORIES.map(cat => (
          <BudgetRow
            key={cat.value}
            category={cat.value}
            label={cat.label}
            initial={byCategory.get(cat.value) ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
