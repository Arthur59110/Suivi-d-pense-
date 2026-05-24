'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from './supabase/server'
import { getSupabaseAdmin } from './supabase/admin'
import { sendPushTo } from './push'
import { getWhoFromEmail, CATEGORIES } from './types'
import {
  expenseSchema,
  revenueSchema,
  savingSchema,
  budgetSchema,
  type ExpenseFormValues,
  type RevenueFormValues,
  type SavingFormValues,
} from './schema'

function fmtAmount(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Notifie Arthur uniquement quand Paloma est l'auteure de l'action
async function notifyArthurIfPaloma(payload: { title: string; body: string; url?: string }) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return
    if (getWhoFromEmail(user.email) !== 'paloma') return
    await sendPushTo('arthur', payload)
  } catch {
    // ne jamais bloquer l'action principale
  }
}

export async function subscribePush(sub: { endpoint: string; p256dh: string; auth: string; who: 'arthur' | 'paloma' }) {
  const db = getSupabaseAdmin()
  const { error } = await db.from('push_subscriptions').upsert({
    endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, who: sub.who,
  }, { onConflict: 'endpoint' })
  if (error) throw new Error(error.message)
}

export async function unsubscribePush(endpoint: string) {
  const db = getSupabaseAdmin()
  await db.from('push_subscriptions').delete().eq('endpoint', endpoint)
}

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
  const catLabel = CATEGORIES.find(c => c.value === parsed.data.category)?.label ?? parsed.data.category
  await notifyArthurIfPaloma({
    title: 'Paloma a ajouté une dépense',
    body: `${parsed.data.description || catLabel} · ${fmtAmount(parsed.data.amount)} €`,
    url: '/depenses',
  })
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

  await notifyArthurIfPaloma({
    title: 'Paloma a pioché dans l\'épargne',
    body: `${savingsAccountName} · -${fmtAmount(revenueData.amount)} €`,
    url: '/epargne',
  })

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
  await notifyArthurIfPaloma({
    title: 'Paloma a ajouté un revenu',
    body: `${parsed.data.description || 'Revenu'} · +${fmtAmount(parsed.data.amount)} €`,
    url: '/revenus',
  })
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
  const isWithdrawal = parsed.data.type === 'withdrawal'
  await notifyArthurIfPaloma({
    title: isWithdrawal ? 'Paloma a fait un retrait' : 'Paloma a mis de côté',
    body: `${parsed.data.account_name} · ${isWithdrawal ? '-' : '+'}${fmtAmount(parsed.data.amount)} €`,
    url: '/epargne',
  })
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

export async function cancelReport(revenueIds: string[]) {
  if (revenueIds.length === 0) return
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').delete().in('id', revenueIds)
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/')
  revalidatePath('/revenus')
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

  if (arthurAmount > 0.01) {
    await supabase.from('revenues').insert({
      amount: Math.round(arthurAmount * 100) / 100,
      description: label,
      source: 'autre',
      who: 'arthur',
      date: nextMonthDate,
      budget_month: nextMonthDate,
    })
  }
  if (palomaAmount > 0.01) {
    await supabase.from('revenues').insert({
      amount: Math.round(palomaAmount * 100) / 100,
      description: label,
      source: 'autre',
      who: 'paloma',
      date: nextMonthDate,
      budget_month: nextMonthDate,
    })
  }

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
