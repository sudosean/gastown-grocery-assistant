import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/plan')
  }

  return (
    <div className="-mx-4 -mt-6">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-6 py-20 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🥗</div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Smart Meal Planning,{' '}
            <span className="text-brand-200">Simplified</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 mb-10 leading-relaxed">
            Let AI plan your weekly meals, track your pantry, and build your
            grocery list — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="border border-brand-300 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Everything you need
          </h2>
          <p className="text-gray-500 text-center mb-10">
            From planning to checkout — we handle the whole process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: '🤖',
                title: 'AI Meal Planning',
                desc: 'Personalized weekly meal plans built around your dietary preferences, household size, and budget.',
              },
              {
                icon: '🛒',
                title: 'Smart Grocery Lists',
                desc: 'Auto-generated shopping lists from your meal plan — no duplicates, no guesswork.',
              },
              {
                icon: '🥫',
                title: 'Pantry Tracking',
                desc: "Tell us what's in your pantry and we'll subtract it from your grocery list automatically.",
              },
              {
                icon: '🔄',
                title: 'Instant Meal Swaps',
                desc: "Don't like a meal? Swap it in one tap while keeping the week balanced and on budget.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-50 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Up and running in three simple steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-8">
            {[
              {
                step: '1',
                title: 'Set your preferences',
                desc: 'Tell us your dietary needs, allergies, household size, and weekly budget.',
                icon: '⚙️',
              },
              {
                step: '2',
                title: 'Get your meal plan',
                desc: 'AI generates a balanced, personalized weekly meal plan you can review and tweak.',
                icon: '📅',
              },
              {
                step: '3',
                title: 'Shop smarter',
                desc: 'Your grocery list is ready — adjusted for what you already have in your pantry.',
                icon: '🛍️',
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="flex-1 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/auth/login"
              className="inline-block bg-brand-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Start planning for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-8 text-center">
        <div className="text-2xl mb-2">🥗</div>
        <p className="text-gray-400 text-sm font-medium mb-1">Grocery Assistant</p>
        <p className="text-gray-600 text-xs">Smart meal planning powered by AI</p>
      </footer>
    </div>
  )
}
