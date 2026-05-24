import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const prevMonth = subMonths(now, 1)
  const prevStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd')
  const prevEnd   = format(endOfMonth(prevMonth),   'yyyy-MM-dd')
  const thisMonthDate = format(startOfMonth(now), 'yyyy-MM-dd')

  const [py, pm] = format(prevMonth, 'yyyy-MM').split('-').map(Number)
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  const label = `Report ${monthNames[pm - 1]} ${py}`

  const db = getSupabaseAdmin()

  // Idempotence : ne pas créer si déjà présent
  const { data: existing } = await db
    .from('revenues')
    .select('id')
    .eq('budget_month', thisMonthDate)
    .like('description', 'Report %')

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Report already exists' })
  }

  const [{ data: revenues }, { data: expenses }] = await Promise.all([
    db.from('revenues').select('who, amount').gte('budget_month', prevStart).lte('budget_month', prevEnd),
    db.from('expenses').select('who, amount').gte('date', prevStart).lte('date', prevEnd),
  ])

  const sum = (rows: { who: string; amount: number }[] | null, who: string) =>
    (rows ?? []).filter(r => r.who === who).reduce((s, r) => s + r.amount, 0)

  const arthurRev  = sum(revenues, 'arthur')
  const palomaRev  = sum(revenues, 'paloma')
  const arthurExp  = sum(expenses, 'arthur')
  const palomaExp  = sum(expenses, 'paloma')

  const balance    = (arthurRev + palomaRev) - (arthurExp + palomaExp)
  if (balance <= 0) {
    return NextResponse.json({ message: 'No positive balance' })
  }

  const arthurNet    = arthurRev - arthurExp
  const arthurAmount = Math.min(Math.max(arthurNet, 0), balance)
  const palomaAmount = balance - arthurAmount

  if (arthurAmount > 0.01) {
    await db.from('revenues').insert({
      amount: Math.round(arthurAmount * 100) / 100,
      description: label, source: 'autre', who: 'arthur',
      date: thisMonthDate, budget_month: thisMonthDate,
    })
  }
  if (palomaAmount > 0.01) {
    await db.from('revenues').insert({
      amount: Math.round(palomaAmount * 100) / 100,
      description: label, source: 'autre', who: 'paloma',
      date: thisMonthDate, budget_month: thisMonthDate,
    })
  }

  return NextResponse.json({ message: 'Report created', arthurAmount, palomaAmount })
}
