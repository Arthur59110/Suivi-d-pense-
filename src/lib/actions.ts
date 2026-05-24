'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from './supabase/server'
import {
  expenseSchema,
  revenueSchema,
  savingSchema,
  budgetSchema,
  type ExpenseFormValues,
  type RevenueFormValues,
  type SavingFormValues,
} from './schema'

function friendlyError(raw: string): string {
  const m = raw.toLowerCase()
  if (m.includes('jwt') || m.includes('auth') || m.includes('not authenticated')) {
    return 'Session expirée, reconnectez-vous'
  }
  if (m.includes('row-level security') || m.includes('permission')) {
    return "Vous n'avez pas les droits pour cette action"
  }
  if (m.includes('network') || m.includes('fetch') || m.includes('econnrefused') || m.includes('timeout')) {
    return 'Connexion impossible, vérifiez votre réseau'
  }
  if (m.includes('check constraint') || m.includes('positive')) {
    return 'Le montant doit être supérieur à zéro'
  }
  if (m.includes('does not exist') || m.includes('relation')) {
    return 'Service temporairement indisponible'
  }
  return "Une erreur est survenue, réessayez dans un instant"
}

export async function createExpense(data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').insert(parsed.data)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/')
}

export async function updateExpense(id: string, data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').update(parsed.data).eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/depenses')
}

export async function deleteExpense(id: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/depenses')
}

export async function signOut() {
  const supabase = await getSupabaseServer()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createRevenueFromSavings(
  revenueData: RevenueFormValues,
  savingsWho: 'arthur' | 'paloma',
  savingsAccountName: string
) {
  const parsedRevenue = revenueSchema.safeParse(revenueData)
  if (!parsedRevenue.success) throw new Error('Données invalides')

  const parsedSaving = savingSchema.safeParse({
    amount: revenueData.amount,
    description: `Virement vers revenus`,
    who: savingsWho,
    type: 'withdrawal',
    account_name: savingsAccountName,
    date: revenueData.date,
  })
  if (!parsedSaving.success) throw new Error('Données épargne invalides')

  const supabase = await getSupabaseServer()
  const [r1, r2] = await Promise.all([
    supabase.from('revenues').insert(parsedRevenue.data),
    supabase.from('savings').insert(parsedSaving.data),
  ])
  if (r1.error) throw new Error(friendlyError(r1.error.message))
  if (r2.error) throw new Error(friendlyError(r2.error.message))

  revalidatePath('/')
  revalidatePath('/revenus')
  revalidatePath('/epargne')
  redirect('/')
}

export async function createRevenue(data: RevenueFormValues) {
  const parsed = revenueSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').insert(parsed.data)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/revenus')
  redirect('/')
}

export async function updateRevenue(id: string, data: RevenueFormValues) {
  const parsed = revenueSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').update(parsed.data).eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/revenus')
  redirect('/revenus')
}

export async function deleteRevenue(id: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/revenus')
}

export async function createSaving(data: SavingFormValues) {
  const parsed = savingSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('savings').insert(parsed.data)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/epargne')
  redirect('/epargne')
}

export async function updateSaving(id: string, data: SavingFormValues) {
  const parsed = savingSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('savings').update(parsed.data).eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/epargne')
  redirect('/epargne')
}

export async function deleteSaving(id: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('savings').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/epargne')
}

export async function reportBalance(
  currentMonthStr: string,
  arthurAmount: number,
  palomaAmount: number,
) {
  const [y, m] = currentMonthStr.split('-').map(Number)
  const nextY = m === 12 ? y + 1 : y
  const nextM = m === 12 ? 1 : m + 1
  const nextMonthStr = `${nextY}-${String(nextM).padStart(2, '0')}`
  const nextMonthDate = `${nextMonthStr}-01`

  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  const label = `Report ${monthNames[m - 1]} ${y}`

  const supabase = await getSupabaseServer()
  const inserts: Promise<unknown>[] = []

  if (arthurAmount > 0.01) {
    inserts.push(supabase.from('revenues').insert({
      amount: Math.round(arthurAmount * 100) / 100,
      description: label,
      source: 'autre',
      who: 'arthur',
      date: nextMonthDate,
      budget_month: nextMonthDate,
    }))
  }
  if (palomaAmount > 0.01) {
    inserts.push(supabase.from('revenues').insert({
      amount: Math.round(palomaAmount * 100) / 100,
      description: label,
      source: 'autre',
      who: 'paloma',
      date: nextMonthDate,
      budget_month: nextMonthDate,
    }))
  }

  await Promise.all(inserts)
  revalidatePath('/')
  revalidatePath('/revenus')
  redirect(`/?month=${nextMonthStr}`)
}

export async function setBudget(category: string, amount: number) {
  const supabase = await getSupabaseServer()
  if (amount <= 0) {
    const { error } = await supabase.from('budgets').delete().eq('category', category)
    if (error) throw new Error(friendlyError(error.message))
  } else {
    const parsed = budgetSchema.safeParse({ category, amount })
    if (!parsed.success) throw new Error('Données invalides')
    const { error } = await supabase
      .from('budgets')
      .upsert(
        { ...parsed.data, updated_at: new Date().toISOString() },
        { onConflict: 'category' },
      )
    if (error) throw new Error(friendlyError(error.message))
  }
  revalidatePath('/')
  revalidatePath('/analyse')
  revalidatePath('/budgets')
}
