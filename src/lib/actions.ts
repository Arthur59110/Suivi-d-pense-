'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from './supabase/server'
import { expenseSchema, revenueSchema, type ExpenseFormValues, type RevenueFormValues } from './schema'

export async function createExpense(data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').insert(parsed.data)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/')
}

export async function updateExpense(id: string, data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').update(parsed.data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/depenses')
}

export async function deleteExpense(id: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/depenses')
}

export async function signOut() {
  const supabase = await getSupabaseServer()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createRevenue(data: RevenueFormValues) {
  const parsed = revenueSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').insert(parsed.data)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/revenus')
  redirect('/')
}

export async function updateRevenue(id: string, data: RevenueFormValues) {
  const parsed = revenueSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').update(parsed.data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/revenus')
  redirect('/revenus')
}

export async function deleteRevenue(id: string) {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.from('revenues').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/revenus')
}
