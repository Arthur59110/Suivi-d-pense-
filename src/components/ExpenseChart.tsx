'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CATEGORIES } from '@/lib/types'
import type { Expense } from '@/lib/types'

interface Props {
  expenses: Expense[]
}

export default function ExpenseChart({ expenses }: Props) {
  const data = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: expenses
      .filter((e) => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Aucune dépense ce mois-ci</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-medium text-slate-700 mb-4">
        Répartition par catégorie
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(2)} €`, 'Montant']}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#475569' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
