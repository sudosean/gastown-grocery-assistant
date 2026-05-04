'use client'

import { useState } from 'react'
import { WeeklyMealPlan, GenerateMealPlanRequest } from '@/types/meal-plan'
import MealPlanCalendar from './MealPlanCalendar'

const COMMON_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
  'nut-free', 'halal', 'kosher', 'low-sodium',
]

export default function MealPlanGenerator() {
  const [householdSize, setHouseholdSize] = useState(2)
  const [weeklyBudget, setWeeklyBudget] = useState(150)
  const [maxCookingTime, setMaxCookingTime] = useState(45)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [pantryText, setPantryText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)

  function toggleRestriction(r: string) {
    setDietaryRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    )
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    const pantryItems = pantryText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const req: GenerateMealPlanRequest = {
      householdSize,
      dietaryRestrictions,
      weeklyBudget,
      maxCookingTime,
      pantryItems,
    }

    try {
      const res = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const plan: WeeklyMealPlan = await res.json()
      setMealPlan(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!mealPlan && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900">Your household</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Household size</label>
              <input
                type="number"
                min={1}
                max={12}
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Weekly budget ($)</label>
              <input
                type="number"
                min={20}
                max={1000}
                step={10}
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-gray-600 mb-1">Max cook time (min)</label>
              <input
                type="number"
                min={10}
                max={180}
                step={5}
                value={maxCookingTime}
                onChange={(e) => setMaxCookingTime(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Dietary restrictions</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_RESTRICTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRestriction(r)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    dietaryRestrictions.includes(r)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Pantry items to use{' '}
              <span className="text-gray-400">(comma-separated, optional)</span>
            </label>
            <input
              type="text"
              placeholder="chicken, pasta, canned tomatoes..."
              value={pantryText}
              onChange={(e) => setPantryText(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                Generating your meal plan…
              </>
            ) : (
              '✨ Generate 7-day meal plan'
            )}
          </button>
        </div>
      )}

      {mealPlan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Plan for {householdSize} {householdSize === 1 ? 'person' : 'people'}
              {dietaryRestrictions.length > 0 && ` · ${dietaryRestrictions.join(', ')}`}
            </p>
            <button
              onClick={() => setMealPlan(null)}
              className="btn-secondary text-sm"
            >
              Regenerate
            </button>
          </div>

          <MealPlanCalendar
            plan={mealPlan}
            householdSize={householdSize}
            dietaryRestrictions={dietaryRestrictions}
          />
        </div>
      )}
    </div>
  )
}
