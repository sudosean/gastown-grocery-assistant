import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingClient } from '@/components/shopping/ShoppingClient'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pantryItems: { name: string; quantity: number; unit: string | null }[] = []
  if (user) {
    const { data } = await supabase
      .from('pantry_items')
      .select('name, quantity, unit')
      .eq('user_id', user.id)
    pantryItems = data ?? []
  }

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-500 text-sm mt-1">Generated from your meal plan</p>
        </div>

        {!user ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="font-semibold text-gray-900 mb-2">Sign in to get started</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign in, create a meal plan, and we&apos;ll generate your shopping list automatically.
            </p>
            <Link href="/auth/login" className="btn-primary">
              Sign in
            </Link>
          </div>
        ) : (
          <ShoppingClient pantryItems={pantryItems} />
        )}
      </div>
    </div>
  )
}
