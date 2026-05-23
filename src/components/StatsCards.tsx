import type { Expense } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  expenses: Expense[]
}

export default function StatsCards({ expenses }: Props) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const count = monthExpenses.length
  const average = count > 0 ? total / count : 0
  const monthLabel = format(now, 'MMMM yyyy', { locale: fr })

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label={`Total ${monthLabel}`}
        value={`${total.toFixed(2)} €`}
        sub={`${count} dépense${count !== 1 ? 's' : ''}`}
      />
      <StatCard
        label="Nombre de dépenses"
        value={count.toString()}
        sub="ce mois-ci"
      />
      <StatCard
        label="Moyenne par dépense"
        value={`${average.toFixed(2)} €`}
        sub="ce mois-ci"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}
