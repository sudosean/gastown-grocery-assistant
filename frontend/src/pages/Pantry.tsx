import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { PantryClient } from '@/components/pantry/PantryClient'

interface PantryItem {
  id: string
  name: string
  quantity: number
  unit: string | null
  category: string | null
  expiry_date: string | null
}

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<PantryItem[]>('/api/pantry')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="pb-20 md:pb-0 md:pl-56">
        <div className="py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
            <p className="text-gray-500 text-sm mt-1">What you have on hand</p>
          </div>
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
          <p className="text-gray-500 text-sm mt-1">What you have on hand</p>
        </div>
        <PantryClient initialItems={items} />
      </div>
    </div>
  )
}
