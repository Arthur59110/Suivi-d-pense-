import ExpenseForm from '@/components/ExpenseForm'

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Nouvelle dépense
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
