'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const statusColors: Record<string, string> = {
  new: 'bg-blue-600 text-white',
  confirmed: 'bg-slate-600 text-white',
  in_progress: 'bg-orange-600 text-white',
  ready: 'bg-green-600 text-white',
  delivered: 'bg-slate-700 text-slate-300',
  cancelled: 'bg-red-600 text-white',
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
    <main className="min-h-screen bg-slate-950 text-white p-6  font-sora">
      <Skeleton className="h-8 w-48 bg-slate-800 mb-4" />
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-96 bg-slate-800 rounded-xl" />
        <Skeleton className="h-96 bg-slate-800 rounded-xl" />
      </div>
    </main>
  )

  if (!order) return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <p>Order not found.</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-base font-semibold text-white">Order Detail</h1>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-2 gap-0 h-[calc(100vh-57px)]">

        {/* LEFT — Order info */}
        <div className="border-r border-slate-800 p-6 overflow-y-auto space-y-4">

          {/* Original message */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-2">Original message</p>
            <p className="text-sm text-slate-200">{order.raw_message}</p>
          </div>

          {/* Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-3">Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.qty} {item.unit}
                      {item.customisation && ` — ${item.customisation}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {order.delivery_date && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                  📅 {new Date(order.delivery_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Suggested reply */}
          {order.suggested_reply && (
            <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-xs text-yellow-500 mb-2">💡 Suggested reply</p>
              <p className="text-sm text-slate-200">{order.suggested_reply}</p>
              <button
                onClick={() => setReply(order.suggested_reply || '')}
                className="text-xs text-yellow-500 mt-2 hover:text-yellow-300 transition"
              >
                Use this →
              </button>
            </div>
          )}

          {/* Status updater */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-3">Update status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || order.status === s}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
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
        </div>

        {/* RIGHT — Conversation + Reply */}
        <div className="flex flex-col h-full">

          {/* Conversation history */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            <p className="text-xs text-slate-500 mb-4">Conversation</p>
            {messages.length === 0 ? (
              <p className="text-xs text-slate-700">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs text-sm px-4 py-2 rounded-2xl ${
                    msg.direction === 'inbound'
                      ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.body}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply box — pinned to bottom */}
          <div className="border-t border-slate-800 p-4 bg-slate-950">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              className="bg-slate-900 border-slate-700 text-white mb-3 resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">
                Reply will be saved to conversation history
              </p>
              <Button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}