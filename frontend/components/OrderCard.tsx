'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ready: 'bg-green-500/10 text-green-400 border-green-500/20',
  delivered: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
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
      })
    : 'No date'

  return (
    <Card
      onClick={() => router.push(`/orders/${order.id}`)}
      className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-all duration-200 cursor-pointer"
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            +{order.customer_id.slice(0, 8)}...
          </span>
          <Badge
            variant="outline"
            className={`text-xs ${statusColors[order.status]}`}
          >
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="text-sm text-slate-200">
              <span className="font-medium">{item.qty} {item.unit}</span>{' '}
              <span>{item.name}</span>
              {item.customisation && (
                <span className="text-slate-500 text-xs ml-1">
                  — {item.customisation}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">📅 {formattedDate}</span>
          {order.is_price_query && (
            <span className="text-xs text-yellow-500">💬 Price query</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}