import { z } from 'zod'

export const expenseSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string().min(1, 'La description est requise'),
  category: z.string().min(1, 'La catégorie est requise'),
  date: z.string().min(1, 'La date est requise'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
