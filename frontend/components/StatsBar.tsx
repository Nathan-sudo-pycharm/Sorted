'use client'

import { Order } from '@/lib/types'

type Props = {
  orders: Order[]
}

export default function StatsBar({ orders }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const ordersToday = orders.filter(
    (o) => o.created_at.split('T')[0] === today
  ).length

  const revenueToday = orders
    .filter((o) => o.created_at.split('T')[0] === today && o.total_amount)
    .reduce((sum, o) => sum + (o.total_amount || 0), 0)

  const pendingDeliveries = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'in_progress' || o.status === 'ready'
  ).length

  const openFollowUps = orders.filter(
    (o) => o.is_price_query && o.status === 'new'
  ).length

  const stats = [
    { label: 'Orders Today', value: ordersToday, icon: '📦' },
    { label: 'Revenue Today', value: revenueToday ? `₹${revenueToday.toLocaleString('en-IN')}` : '₹0', icon: '💰' },
    { label: 'Pending Deliveries', value: pendingDeliveries, icon: '🚗' },
    { label: 'Open Follow-ups', value: openFollowUps, icon: '💬' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-xs text-slate-400">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}