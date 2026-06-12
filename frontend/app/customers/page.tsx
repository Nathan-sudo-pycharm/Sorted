'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await fetch('http://127.0.0.1:8000/customers')
      const data = await res.json()
      setCustomers(data.customers || [])
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white  font-sora">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-white">Customers</h1>
        </div>
        <span className="text-xs text-slate-500">{customers.length} total</span>
      </div>

      {/* Customer grid */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => router.push(`/customers/${customer.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200"
              >
                <p className="text-sm font-medium text-white truncate">
                  {customer.display_name || `+${customer.phone_number}`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                  +{customer.phone_number}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {customer.total_orders} orders
                  </span>
                  {customer.last_order_at && (
                    <span className="text-xs text-slate-600">
                      {new Date(customer.last_order_at).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
                {customer.notes && (
                  <p className="text-xs text-yellow-500/70 mt-2 truncate">
                    📝 {customer.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}