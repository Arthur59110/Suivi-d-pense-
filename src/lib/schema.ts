import { z } from 'zod'

export const expenseSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string(),
  category: z.string().min(1, 'La catégorie est requise'),
  who: z.enum(['arthur', 'paloma']),
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
