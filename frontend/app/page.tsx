'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus } from '@/lib/types'
import OrderCard from '@/components/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'

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

    // Supabase Realtime
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sorted 🍰</h1>
        <p className="text-slate-400 text-sm mt-1">
          {orders.length} orders total
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = getOrdersByStatus(col.status)
          return (
            <div key={col.status} className="flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-300">
                  {col.label}
                </span>
                <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              {loading ? (
                <>
                  <Skeleton className="h-24 bg-slate-800 rounded-lg" />
                  <Skeleton className="h-24 bg-slate-800 rounded-lg" />
                </>
              ) : colOrders.length === 0 ? (
                <div className="text-xs text-slate-700 text-center py-6 border border-dashed border-slate-800 rounded-lg">
                  No orders
                </div>
              ) : (
                colOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}