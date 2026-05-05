import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import { ShoppingClient } from '@/components/shopping/ShoppingClient'

interface PantryItem {
  name: string
  quantity: number
  unit: string | null
}

export default function Shopping() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<PantryItem[]>('/api/pantry')
      .then(setPantryItems)
      .catch(() => setPantryItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="pb-20 md:pb-0 md:pl-56">
        <div className="py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
            <p className="text-gray-500 text-sm mt-1">Generated from your meal plan</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-500 text-sm mt-1">Generated from your meal plan</p>
        </div>
        <ShoppingClient pantryItems={pantryItems} />
      </div>
    </div>
  )
}
