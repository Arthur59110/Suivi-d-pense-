export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  created_at: string
}

export const CATEGORIES = [
  { value: 'alimentation', label: 'Alimentation', color: '#f97316' },
  { value: 'transport', label: 'Transport', color: '#3b82f6' },
  { value: 'logement', label: 'Logement', color: '#8b5cf6' },
  { value: 'sante', label: 'Santé', color: '#10b981' },
  { value: 'loisirs', label: 'Loisirs', color: '#f59e0b' },
  { value: 'vetements', label: 'Vêtements', color: '#ec4899' },
  { value: 'education', label: 'Éducation', color: '#06b6d4' },
  { value: 'autre', label: 'Autre', color: '#94a3b8' },
] as const
