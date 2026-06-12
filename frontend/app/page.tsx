'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus } from '@/lib/types'
import KanbanColumn from '@/components/KanbanColumn'
import StatsBar from '@/components/StatsBar'

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'new', label: 'New' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'ready', label: 'Ready' },
  { status: 'delivered', label: 'Delivered' },
]

export default function Home() {
  const router = useRouter()
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
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍰</span>
            <h1 className="text-lg font-bold text-white  font-sora">Sorted</h1>
          </div>
          {/* Nav links */}
          <nav className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-white border-b border-white pb-0.5"
            >
              Orders
            </button>
            <button
              onClick={() => router.push('/customers')}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Customers
            </button>
            <button
              onClick={() => router.push('/menu')}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Menu
            </button>
          </nav>
        </div>
        <button className="text-slate-400 hover:text-white transition">
          🔔
        </button>
      </div>

      {/* Main content */}
      <div className="p-6">
        <StatsBar orders={orders} />
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-4">
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
        </div>
      </div>
    </main>
  )
}