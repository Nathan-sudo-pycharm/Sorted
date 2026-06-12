'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

type MenuItem = {
  id: string
  name: string
  aliases: string[]
  base_price: number | null
  unit: string
  active: boolean
}

export default function MenuPage() {
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // New item form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('piece')
  const [aliases, setAliases] = useState('')

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const res = await fetch('http://127.0.0.1:8000/menu')
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  const addItem = async () => {
    if (!name.trim()) return
    setAdding(true)
    await fetch('http://127.0.0.1:8000/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        base_price: price ? parseFloat(price) : null,
        unit,
        aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
      }),
    })
    setName('')
    setPrice('')
    setUnit('piece')
    setAliases('')
    setAdding(false)
    fetchMenu()
  }

  const toggleActive = async (item: MenuItem) => {
    await fetch(`http://127.0.0.1:8000/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, active: !i.active } : i)
    )
  }

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
          <h1 className="text-base font-semibold text-white">Menu</h1>
        </div>
        <span className="text-xs text-slate-500">{items.length} items</span>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Add new item form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-white mb-4">Add menu item</p>
          <div className="space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name e.g. Black Forest Cake"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Base price e.g. 650"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="piece">piece</option>
                <option value="kg">kg</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
              </select>
            </div>
            <Input
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="Aliases (comma separated) e.g. BF cake, black forest, chocolate one"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              onClick={addItem}
              disabled={adding || !name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {adding ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </div>

        {/* Menu items list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">
            No menu items yet — add your first item above
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  item.active ? 'border-slate-800' : 'border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.base_price ? `₹${item.base_price}` : 'No price set'} · per {item.unit}
                    </p>
                    {item.aliases.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.aliases.map((alias, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${
                      item.active
                        ? 'border-green-500/30 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                        : 'border-slate-700 text-slate-500 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}