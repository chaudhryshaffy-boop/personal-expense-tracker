export interface User {
  id: number
  email: string
  full_name?: string | null
  currency?: string | null
  created_at: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  date: string
  category_id?: number | null
  type: TransactionType
  amount: number
  description?: string | null
  account_id: number
  tags?: string[] | null
}
