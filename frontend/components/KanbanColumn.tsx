'use client'

import { Order, OrderStatus } from '@/lib/types'
import OrderCard from '@/components/OrderCard'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  status: OrderStatus
  label: string
  orders: Order[]
  loading: boolean
}

export default function KanbanColumn({ status, label, orders, loading }: Props) {
  const isNew = status === 'new'

  return (
    <div className="w-80 flex-shrink-0 flex flex-col">
      {/* Column header */}
      <div className={`mb-4 pb-3 border-b-2 relative ${
        isNew ? 'border-blue-500' : 'border-slate-700'
      }`}>
        {isNew && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 blur-md opacity-50" />
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">{label}</h2>
          <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-28 bg-slate-800 rounded-xl" />
            <Skeleton className="h-28 bg-slate-800 rounded-xl" />
          </>
        ) : orders.length === 0 ? (
          <div className="text-xs text-slate-700 text-center py-8 border border-dashed border-slate-800 rounded-xl">
            No orders
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}