import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const SAMPLE_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains & Pasta',
  'Canned & Jarred',
  'Frozen',
  'Spices & Condiments',
  'Other',
]

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
            <p className="text-gray-500 text-sm mt-1">What you have on hand</p>
          </div>
          {user ? (
            <button className="btn-primary text-sm">
              + Add item
            </button>
          ) : (
            <Link href="/auth/login" className="btn-secondary text-sm">
              Sign in
            </Link>
          )}
        </div>

        {!user ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">🥫</p>
            <h2 className="font-semibold text-gray-900 mb-2">Your pantry is empty</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to start tracking your pantry items.
            </p>
            <Link href="/auth/login" className="btn-primary">
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {SAMPLE_CATEGORIES.map((category) => (
              <div key={category} className="card">
                <h3 className="font-medium text-gray-700 mb-2 text-sm">{category}</h3>
                <p className="text-xs text-gray-400 italic">No items</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
