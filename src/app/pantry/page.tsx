import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PantryClient } from '@/components/pantry/PantryClient'

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let items = []
  if (user) {
    const { data } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    items = data ?? []
  }

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
          <p className="text-gray-500 text-sm mt-1">What you have on hand</p>
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
          <PantryClient initialItems={items} />
        )}
      </div>
    </div>
  )
}
