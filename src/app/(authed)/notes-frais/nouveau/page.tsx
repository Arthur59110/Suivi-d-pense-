import NewExpenseNoteForm from '@/components/NewExpenseNoteForm'

export default async function NewExpenseNotePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string }>
}) {
  const { type } = await searchParams
  const defaultType: 'advance' | 'reimbursement' =
    type === 'reimbursement' ? 'reimbursement' : 'advance'
  return <NewExpenseNoteForm defaultType={defaultType} />
}
