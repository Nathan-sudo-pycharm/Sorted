export type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'

export type OrderItem = {
  name: string
  qty: number
  unit: string
  customisation: string | null
}

export type Order = {
  id: string
  customer_id: string
  raw_message: string
  items: OrderItem[]
  delivery_date: string | null
  status: OrderStatus
  is_price_query: boolean
  suggested_reply: string | null
  total_amount: number | null
  advance_paid: number | null
  created_at: string
}