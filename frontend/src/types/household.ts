export interface HouseholdProfile {
  id: string
  user_id: string
  num_adults: number
  num_children: number
  dietary_preferences: DietaryPreference[]
  allergies: string[]
  intolerances: string[]
  weekly_budget_cents: number
  cooking_time_per_meal_minutes: number
  preferred_cuisines: string[]
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free'
  | 'halal'
  | 'kosher'

export const DIETARY_PREFERENCES: { value: DietaryPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'gluten_free', label: 'Gluten-free' },
  { value: 'dairy_free', label: 'Dairy-free' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
]

export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
]

export const COMMON_INTOLERANCES = [
  'Lactose',
  'Gluten',
  'Fructose',
  'FODMAPs',
  'Histamine',
  'Sulfites',
]

export const CUISINE_TYPES = [
  'American',
  'Italian',
  'Mexican',
  'Asian',
  'Japanese',
  'Chinese',
  'Indian',
  'Mediterranean',
  'Middle Eastern',
  'French',
  'Thai',
  'Greek',
]

export const COOKING_TIME_OPTIONS = [
  { value: 15, label: '15 min (quick)' },
  { value: 30, label: '30 min (weeknight)' },
  { value: 45, label: '45 min (moderate)' },
  { value: 60, label: '1 hour (relaxed)' },
  { value: 90, label: '90+ min (weekend)' },
]

export const BUDGET_OPTIONS = [
  { value: 7500, label: '$75/week' },
  { value: 10000, label: '$100/week' },
  { value: 15000, label: '$150/week' },
  { value: 20000, label: '$200/week' },
  { value: 30000, label: '$300/week' },
  { value: 50000, label: '$500+/week' },
]
