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
  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      {loading ? (
        <>
          <Skeleton className="h-24 bg-slate-800 rounded-lg" />
          <Skeleton className="h-24 bg-slate-800 rounded-lg" />
        </>
      ) : orders.length === 0 ? (
        <div className="text-xs text-slate-700 text-center py-6 border border-dashed border-slate-800 rounded-lg">
          No orders
        </div>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  )
}