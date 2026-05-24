export const dynamic = 'force-dynamic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NewSavingForm from '@/components/NewSavingForm'

export default async function NewSavingPage() {
  const store = await cookies()
  if (store.get('epg')?.value !== '1') redirect('/epargne')
  return <NewSavingForm />
}
