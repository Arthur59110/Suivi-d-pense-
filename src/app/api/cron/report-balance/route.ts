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

  const [{ data: revenues }, { data: expenses }, { data: savingsData }] = await Promise.all([
    db.from('revenues').select('who, amount').gte('budget_month', prevStart).lte('budget_month', prevEnd),
    db.from('expenses').select('who, amount').neq('category', 'epargne').gte('date', prevStart).lte('date', prevEnd),
    db.from('savings').select('who, amount, type').gte('date', prevStart).lte('date', prevEnd),
  ])

  const sum = (rows: { who: string; amount: number }[] | null, who: string) =>
    (rows ?? []).filter(r => r.who === who).reduce((s, r) => s + r.amount, 0)
  const netSav = (who: string) =>
    sum(savingsData?.filter(sv => sv.type === 'deposit') ?? [], who) -
    sum(savingsData?.filter(sv => sv.type === 'withdrawal') ?? [], who)

  const arthurAmount = Math.max(sum(revenues, 'arthur') - sum(expenses, 'arthur') - netSav('arthur'), 0)
  const palomaAmount = Math.max(sum(revenues, 'paloma') - sum(expenses, 'paloma') - netSav('paloma'), 0)

  if (arthurAmount + palomaAmount <= 0) {
    return NextResponse.json({ message: 'No positive balance' })
  }

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
