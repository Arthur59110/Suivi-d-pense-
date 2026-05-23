'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from './supabase'
import { expenseSchema, type ExpenseFormValues } from './schema'

export async function createExpense(data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')

  const { error } = await supabase.from('expenses').insert(parsed.data)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/depenses')
}

export async function updateExpense(id: string, data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) throw new Error('Données invalides')

  const { error } = await supabase
    .from('expenses')
    .update(parsed.data)
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/depenses')
  redirect('/depenses')
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/depenses')
}
