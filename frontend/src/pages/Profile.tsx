import { useState, useEffect } from 'react'
import { apiClient } from '@/api/client'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import type { HouseholdProfile } from '@/types/household'

type FormData = Omit<HouseholdProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'onboarding_completed'>

export default function Profile() {
  const [initialData, setInitialData] = useState<Partial<FormData> | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<HouseholdProfile>('/api/profile')
      .then((profile) => {
        if (profile) {
          setInitialData({
            num_adults: profile.num_adults,
            num_children: profile.num_children,
            dietary_preferences: profile.dietary_preferences,
            allergies: profile.allergies,
            intolerances: profile.intolerances,
            weekly_budget_cents: profile.weekly_budget_cents,
            cooking_time_per_meal_minutes: profile.cooking_time_per_meal_minutes,
            preferred_cuisines: profile.preferred_cuisines,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-400 p-6">Loading…</p>

  return <OnboardingWizard initialData={initialData} isEdit />
}
