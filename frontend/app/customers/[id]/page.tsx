'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

type Customer = {
  id: string
  phone_number: string
  display_name: string | null
  total_orders: number
  last_order_at: string | null
  notes: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-600 text-white',
  confirmed: 'bg-slate-600 text-white',
  in_progress: 'bg-orange-600 text-white',
  ready: 'bg-green-600 text-white',
  delivered: 'bg-slate-700 text-slate-300',
  cancelled: 'bg-red-600 text-white',
}

export default function CustomerDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomer = async () => {
      const res = await fetch(`http://127.0.0.1:8000/customers/${id}`)
      const data = await res.json()
      setCustomer(data.customer)
      setOrders(data.orders || [])
      setLoading(false)
    }
    fetchCustomer()
  }, [id])

  if (loading) return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Skeleton className="h-8 w-48 bg-slate-800 mb-4" />
      <Skeleton className="h-48 bg-slate-800 rounded-xl" />
    </main>
  )

  if (!customer) return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <p>Customer not found.</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/customers')}
            className="text-slate-400 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-white">
            {customer.display_name || `+${customer.phone_number}`}
          </h1>
        </div>
        <span className="text-xs text-slate-500">{orders.length} orders</span>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        {/* Customer info card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Phone</p>
              <p className="text-sm font-mono text-white">+{customer.phone_number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Orders</p>
              <p className="text-sm text-white">{customer.total_orders}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">First seen</p>
              <p className="text-sm text-white">
                {new Date(customer.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            {customer.last_order_at && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Last order</p>
                <p className="text-sm text-white">
                  {new Date(customer.last_order_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-yellow-500/80">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Order history */}
        <p className="text-xs text-slate-500 mb-3">Order history</p>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
            No orders yet
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {order.items?.[0] && (
                      <p className="text-sm font-medium text-white">
                        {order.items[0].qty} {order.items[0].unit} {order.items[0].name}
                      </p>
                    )}
                    {order.items?.length > 1 && (
                      <p className="text-xs text-slate-500">
                        +{order.items.length - 1} more
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 truncate">{order.raw_message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}