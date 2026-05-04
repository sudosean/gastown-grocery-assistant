import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart Meal Planning
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Plan meals, manage your pantry, and build smart grocery lists.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/plan" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <span className="text-4xl">📅</span>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Meal Plan
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Plan your weekly meals with AI assistance
                </p>
              </div>
            </div>
          </Link>

          <Link href="/pantry" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🥫</span>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Pantry
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track what you have on hand
                </p>
              </div>
            </div>
          </Link>

          <Link href="/shopping" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🛒</span>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Shopping List
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated from your meal plan
                </p>
              </div>
            </div>
          </Link>

          <Link href="/auth/login" className="card hover:shadow-md transition-shadow group border-dashed">
            <div className="flex items-start gap-4">
              <span className="text-4xl">👤</span>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  Get Started
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to save your plans
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="card bg-brand-50 border-brand-100">
          <h3 className="font-semibold text-brand-800 mb-2">How it works</h3>
          <ol className="space-y-2 text-sm text-brand-700">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Set up your household profile and dietary preferences</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Generate a weekly meal plan with AI</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Review your pantry — we&apos;ll subtract what you already have</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Get a smart shopping list for what you need</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
