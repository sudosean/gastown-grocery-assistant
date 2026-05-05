import { useState } from 'react'
import { apiClient } from '@/api/client'
import type { Meal } from '@/types/meal-plan'

interface MealCardProps {
  meal: Meal
  mealType: 'breakfast' | 'lunch' | 'dinner'
  day: string
  householdSize: number
  dietaryRestrictions: string[]
  onSwap: (newMeal: Meal) => void
}

export default function MealCard({
  meal,
  mealType,
  day,
  householdSize,
  dietaryRestrictions,
  onSwap,
}: MealCardProps) {
  const [swapping, setSwapping] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  async function handleSwap() {
    setSwapping(true)
    try {
      const newMeal = await apiClient.post<Meal>('/api/meal-plan/swap', {
        day,
        mealType,
        currentMeal: meal,
        householdSize,
        dietaryRestrictions,
        dislikedMeal: meal.name,
      })
      onSwap(newMeal)
    } catch {
      alert('Failed to swap meal. Please try again.')
    } finally {
      setSwapping(false)
    }
  }

  const mealTypeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <div className="bg-gray-50 rounded-lg p-2 min-h-[72px] border border-gray-100 group relative">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium mb-0.5">{mealTypeLabel}</p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-gray-800 text-left hover:text-brand-700 transition-colors leading-tight"
          >
            {meal.name}
          </button>
        </div>
        <button
          onClick={handleSwap}
          disabled={swapping}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-brand-600 disabled:opacity-30 flex-shrink-0 p-0.5"
          title="Swap this meal"
        >
          {swapping ? (
            <span className="text-xs animate-spin inline-block">↻</span>
          ) : (
            <span className="text-xs">↺</span>
          )}
        </button>
      </div>

      {showDetails && (
        <div className="mt-1.5 pt-1.5 border-t border-gray-200 space-y-1">
          <p className="text-xs text-gray-500 leading-snug">{meal.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>${meal.estimatedCost.toFixed(2)}</span>
            <span>·</span>
            <span>{meal.prepTime}min</span>
          </div>
        </div>
      )}
    </div>
  )
}
