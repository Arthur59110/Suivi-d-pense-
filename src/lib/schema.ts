import { z } from 'zod'

export const expenseSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string(),
  category: z.string().min(1, 'La catégorie est requise'),
  who: z.enum(['arthur', 'paloma']),
  is_personal: z.boolean().default(false),
  date: z.string().min(1, 'La date est requise'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export const revenueSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string(),
  source: z.string().min(1, 'La source est requise'),
  who: z.enum(['arthur', 'paloma']),
  date: z.string().min(1, 'La date est requise'),
})

export type RevenueFormValues = z.infer<typeof revenueSchema>

export const savingSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string(),
  who: z.enum(['arthur', 'paloma']),
  type: z.enum(['deposit', 'withdrawal']).default('deposit'),
  date: z.string().min(1, 'La date est requise'),
})

export type SavingFormValues = z.infer<typeof savingSchema>

export const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive('Le montant doit être positif'),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>
