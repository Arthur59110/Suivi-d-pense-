export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  who: 'arthur' | 'paloma'
  date: string
  created_at: string
}

export const CATEGORIES = [
  { value: 'loyer', label: 'Loyer', icon: 'Home' },
  { value: 'courses', label: 'Courses', icon: 'ShoppingCart' },
  { value: 'loisirs', label: 'Loisirs', icon: 'Smile' },
  { value: 'restaurants', label: 'Restaurants', icon: 'UtensilsCrossed' },
  { value: 'transport', label: 'Transport', icon: 'Car' },
  { value: 'factures', label: 'Factures', icon: 'Wifi' },
  { value: 'sante', label: 'Santé', icon: 'Heart' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'voyages', label: 'Voyages', icon: 'Plane' },
  { value: 'autre', label: 'Autre', icon: 'MoreHorizontal' },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

export function getUserName(email: string): 'Arthur' | 'Paloma' {
  return email.toLowerCase().includes('arthur') ? 'Arthur' : 'Paloma'
}

export function getWhoFromEmail(email: string): 'arthur' | 'paloma' {
  return email.toLowerCase().includes('arthur') ? 'arthur' : 'paloma'
}

export interface Revenue {
  id: string
  amount: number
  description: string
  source: string
  who: 'arthur' | 'paloma'
  date: string
  created_at: string
}

export const REVENUE_SOURCES = [
  { value: 'salaire', label: 'Salaire', icon: 'Briefcase' },
  { value: 'freelance', label: 'Freelance', icon: 'Laptop' },
  { value: 'aides', label: 'Aides', icon: 'HandCoins' },
  { value: 'cadeau', label: 'Cadeau', icon: 'Gift' },
  { value: 'remboursement', label: 'Remb.', icon: 'RotateCcw' },
  { value: 'autre', label: 'Autre', icon: 'MoreHorizontal' },
] as const

export type RevenueSourceValue = typeof REVENUE_SOURCES[number]['value']

export interface Saving {
  id: string
  amount: number
  description: string
  who: 'arthur' | 'paloma'
  date: string
  created_at: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  created_at: string
  updated_at: string
}
