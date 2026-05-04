export interface Meal {
  name: string
  description: string
  estimatedCost: number
  prepTime: number
}

export interface DayPlan {
  day: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export interface WeeklyMealPlan {
  days: DayPlan[]
  totalEstimatedCost: number
  generatedAt: string
}

export interface GenerateMealPlanRequest {
  householdSize: number
  dietaryRestrictions: string[]
  weeklyBudget: number
  maxCookingTime: number
  pantryItems: string[]
}

export interface SwapMealRequest {
  day: string
  mealType: 'breakfast' | 'lunch' | 'dinner'
  currentMeal: Meal
  householdSize: number
  dietaryRestrictions: string[]
  dislikedMeal: string
}
