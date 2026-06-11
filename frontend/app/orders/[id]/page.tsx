'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ready: 'bg-green-500/10 text-green-400 border-green-500/20',
  delivered: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const STATUSES = ['new', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled']

type Message = {
  id: string
  direction: 'inbound' | 'outbound'
  body: string
  created_at: string
}

export default function OrderDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`http://127.0.0.1:8000/orders/${id}`)
      const data = await res.json()
      setOrder(data.order)
      setMessages(data.messages || [])
      setLoading(false)
    }
    fetchOrder()
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    await fetch(`http://127.0.0.1:8000/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrder((prev) => prev ? { ...prev, status: status as any } : prev)
    setUpdating(false)
  }

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    await fetch(`http://127.0.0.1:8000/orders/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply }),
    })
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      direction: 'outbound',
      body: reply,
      created_at: new Date().toISOString(),
    }])
    setReply('')
    setSending(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Skeleton className="h-8 w-48 bg-slate-800 mb-4" />
      <Skeleton className="h-48 bg-slate-800 rounded-lg" />
    </main>
  )

  if (!order) return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <p>Order not found.</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="text-slate-400 text-sm mb-6 hover:text-white transition"
      >
        ← Back to board
      </button>

      {/* Order header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Order Detail</h1>
        <Badge variant="outline" className={statusColors[order.status]}>
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Raw message */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 mb-1">Original message</p>
        <p className="text-slate-200 text-sm">{order.raw_message}</p>
      </div>

      {/* Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 mb-2">Items</p>
        {order.items?.map((item, i) => (
          <div key={i} className="text-sm text-slate-200 mb-1">
            <span className="font-medium">{item.qty} {item.unit} {item.name}</span>
            {item.customisation && (
              <span className="text-slate-500 ml-2">— {item.customisation}</span>
            )}
          </div>
        ))}
        {order.delivery_date && (
          <p className="text-xs text-slate-500 mt-2">
            📅 Delivery: {new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Suggested reply */}
      {order.suggested_reply && (
        <div className="bg-slate-900 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <p className="text-xs text-yellow-500 mb-1">💡 Suggested reply</p>
          <p className="text-slate-200 text-sm">{order.suggested_reply}</p>
          <button
            onClick={() => setReply(order.suggested_reply || '')}
            className="text-xs text-yellow-500 mt-2 hover:text-yellow-300 transition"
          >
            Use this →
          </button>
        </div>
      )}

      {/* Status updater */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 mb-2">Update status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || order.status === s}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                order.status === s
                  ? 'border-white text-white bg-white/10'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 mb-3">Conversation</p>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm p-2 rounded-lg max-w-xs ${
                msg.direction === 'inbound'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-blue-600/20 text-blue-200 ml-auto text-right'
              }`}
            >
              {msg.body}
            </div>
          ))}
        </div>
      </div>

      {/* Reply box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-xs text-slate-500 mb-2">Send reply</p>
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="bg-slate-800 border-slate-700 text-white mb-2 resize-none"
          rows={3}
        />
        <Button
          onClick={sendReply}
          disabled={sending || !reply.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {sending ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </main>
  )
}