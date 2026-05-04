import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
            <p className="text-gray-500 text-sm mt-1">Generated from your meal plan</p>
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
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="font-semibold text-gray-900 mb-2">No shopping list yet</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign in, create a meal plan, and we&apos;ll generate your shopping list automatically.
            </p>
            <Link href="/auth/login" className="btn-primary">
              Get started
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card">
              <p className="text-sm text-gray-500 text-center py-6">
                No items yet. Create a meal plan to auto-generate your list.
              </p>
              <div className="flex justify-center">
                <Link href="/plan" className="btn-secondary text-sm">
                  Go to Meal Plan →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
