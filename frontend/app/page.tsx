'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus } from '@/lib/types'
import KanbanColumn from '@/components/KanbanColumn'

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'new', label: '🆕 New' },
  { status: 'confirmed', label: '✅ Confirmed' },
  { status: 'in_progress', label: '🍳 In Progress' },
  { status: 'ready', label: '📦 Ready' },
  { status: 'delivered', label: '🎉 Delivered' },
]

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔴 Realtime event received:', payload)
          setOrders((prev) => [payload.new as Order, ...prev])
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status)

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sorted 🍰</h1>
        <p className="text-slate-400 text-sm mt-1">{orders.length} orders total</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            orders={getOrdersByStatus(col.status)}
            loading={loading}
          />
        ))}
      </div>
    </main>
  )
}