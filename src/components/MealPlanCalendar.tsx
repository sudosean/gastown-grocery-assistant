'use client'

import { useState } from 'react'
import { WeeklyMealPlan, Meal, DayPlan } from '@/types/meal-plan'
import MealCard from './MealCard'

interface MealPlanCalendarProps {
  plan: WeeklyMealPlan
  householdSize: number
  dietaryRestrictions: string[]
}

export default function MealPlanCalendar({
  plan,
  householdSize,
  dietaryRestrictions,
}: MealPlanCalendarProps) {
  const [days, setDays] = useState<DayPlan[]>(plan.days)

  function handleSwap(dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', newMeal: Meal) {
    setDays((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, [mealType]: newMeal } : day
      )
    )
  }

  const totalCost = days.reduce(
    (sum, day) =>
      sum + day.breakfast.estimatedCost + day.lunch.estimatedCost + day.dinner.estimatedCost,
    0
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <span>7-day plan generated</span>
        <span className="font-medium text-gray-700">
          Est. total: <span className="text-brand-700">${totalCost.toFixed(2)}</span>
        </span>
      </div>

      {days.map((dayPlan, i) => (
        <div key={dayPlan.day} className="card">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">{dayPlan.day}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
              <MealCard
                key={mealType}
                meal={dayPlan[mealType]}
                mealType={mealType}
                day={dayPlan.day}
                householdSize={householdSize}
                dietaryRestrictions={dietaryRestrictions}
                onSwap={(newMeal) => handleSwap(i, mealType, newMeal)}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 text-center pt-1">
        Hover any meal and click ↺ to swap it
      </p>
    </div>
  )
}
