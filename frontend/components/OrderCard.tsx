'use client'

import { useRouter } from 'next/navigation'
import { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  new: 'bg-blue-600 text-white',
  confirmed: 'bg-slate-600 text-white',
  in_progress: 'bg-orange-600 text-white',
  ready: 'bg-green-600 text-white',
  delivered: 'bg-slate-700 text-slate-300',
  cancelled: 'bg-red-600 text-white',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

type Props = {
  order: Order
}

export default function OrderCard({ order }: Props) {
  const router = useRouter()

  const formattedDate = order.delivery_date
    ? new Date(order.delivery_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  const firstItem = order.items?.[0]

  return (
    <div
      onClick={() => router.push(`/orders/${order.id}`)}
      className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50"
    >
      {/* Phone number */}
      <p className="text-xs text-slate-500 mb-2 font-mono">
        +{order.customer_id.slice(0, 12)}...
      </p>

      {/* Item name */}
      {firstItem && (
        <>
          <p className="text-sm font-semibold text-white mb-1">
            {firstItem.name}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Qty: {firstItem.qty} {firstItem.unit}
            {firstItem.customisation && ` — ${firstItem.customisation}`}
          </p>
        </>
      )}

      {/* Multiple items indicator */}
      {order.items?.length > 1 && (
        <p className="text-xs text-slate-500 mb-3">
          +{order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}
        </p>
      )}

      {/* Delivery date */}
      {formattedDate && (
        <p className="text-xs text-slate-500 mb-3">
          📅 {formattedDate}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
        {order.is_price_query && (
          <span className="text-xs text-yellow-500">💬 Price query</span>
        )}
      </div>
    </div>
  )
}