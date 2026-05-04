import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
            <p className="text-gray-500 text-sm mt-1">This week&apos;s meals</p>
          </div>
          {user ? (
            <button className="btn-primary text-sm">
              ✨ Generate with AI
            </button>
          ) : (
            <Link href="/auth/login" className="btn-secondary text-sm">
              Sign in to plan
            </Link>
          )}
        </div>

        {!user && (
          <div className="card bg-amber-50 border-amber-100 mb-6">
            <p className="text-sm text-amber-700">
              <Link href="/auth/login" className="font-medium underline">
                Sign in
              </Link>{' '}
              to save your meal plans and generate them with AI.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="card">
              <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TYPES.map((meal) => (
                  <div
                    key={meal}
                    className="bg-gray-50 rounded-lg p-2 min-h-[60px] border border-dashed border-gray-200"
                  >
                    <p className="text-xs text-gray-400 font-medium mb-1">{meal}</p>
                    <p className="text-xs text-gray-300 italic">Empty</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
