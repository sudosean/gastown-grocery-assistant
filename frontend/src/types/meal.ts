export interface Meal {
  name: string
  description: string
  estimated_cost_cents: number
  prep_time_minutes: number
  cuisine_tags: string[]
  ingredient_tags: string[]
}

export type MealRejectionReason = 'dietary_issue' | 'dislike' | 'too_complex' | 'too_expensive'

export const REJECTION_REASON_LABELS: Record<MealRejectionReason, string> = {
  dietary_issue: 'Dietary issue',
  dislike: "Don't like it",
  too_complex: 'Too complex to make',
  too_expensive: 'Too expensive',
}

export interface MealRejection {
  id: string
  user_id: string
  meal_name: string
  rejection_reason: MealRejectionReason
  cuisine_tags: string[]
  ingredient_tags: string[]
  plan_date: string | null
  created_at: string
}

export interface SwapRequest {
  meal: Meal
  day_index: number
  meal_slot: 'breakfast' | 'lunch' | 'dinner'
  reason: MealRejectionReason
}

export interface SwapResponse {
  alternatives: Meal[]
  rejection_id: string
}
