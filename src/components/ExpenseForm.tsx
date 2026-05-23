'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { expenseSchema, type ExpenseFormValues } from '@/lib/schema'
import { CATEGORIES } from '@/lib/types'
import { createExpense, updateExpense } from '@/lib/actions'
import Link from 'next/link'

interface Props {
  defaultValues?: Partial<ExpenseFormValues>
  expenseId?: string
}

export default function ExpenseForm({ defaultValues, expenseId }: Props) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ?? {
      date: new Date().toISOString().split('T')[0],
    },
  })

  function onSubmit(data: ExpenseFormValues) {
    startTransition(async () => {
      if (expenseId) {
        await updateExpense(expenseId, data)
      } else {
        await createExpense(data)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Montant (€)
        </label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.amount && (
          <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <input
          {...register('description')}
          type="text"
          placeholder="Ex : Courses Carrefour"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Catégorie
        </label>
        <select
          {...register('category')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Sélectionner une catégorie</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-red-500 mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Date
        </label>
        <input
          {...register('date')}
          type="date"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.date && (
          <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? 'Enregistrement...'
            : expenseId
              ? 'Mettre à jour'
              : 'Ajouter'}
        </button>
        <Link
          href="/depenses"
          className="px-5 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  )
}
