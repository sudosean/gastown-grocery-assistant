import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { HouseholdProfile } from '@/types/household'

export async function getHouseholdProfile(): Promise<HouseholdProfile | null> {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error?.code === 'PGRST116') return null // not found
  if (error) throw error
  return data
}

export async function upsertHouseholdProfile(
  profile: Partial<Omit<HouseholdProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<HouseholdProfile> {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('household_profiles')
    .upsert({ ...profile, user_id: user.id }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}
