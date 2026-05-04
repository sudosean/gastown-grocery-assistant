import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import type { HouseholdProfile } from '@/types/household'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const initialData = profile
    ? {
        num_adults: (profile as HouseholdProfile).num_adults,
        num_children: (profile as HouseholdProfile).num_children,
        dietary_preferences: (profile as HouseholdProfile).dietary_preferences,
        allergies: (profile as HouseholdProfile).allergies,
        intolerances: (profile as HouseholdProfile).intolerances,
        weekly_budget_cents: (profile as HouseholdProfile).weekly_budget_cents,
        cooking_time_per_meal_minutes: (profile as HouseholdProfile).cooking_time_per_meal_minutes,
        preferred_cuisines: (profile as HouseholdProfile).preferred_cuisines,
      }
    : undefined

  return <OnboardingWizard initialData={initialData} isEdit />
}
