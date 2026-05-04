import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { buildPreferenceContext, buildPreferencePromptFragment } from '@/lib/meal-preferences'
import type { MealRejection } from '@/types/meal'

// Returns preference context + prompt fragment for use by the meal plan generation route
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rejections, error } = await supabase
    .from('meal_rejections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }

  const ctx = buildPreferenceContext((rejections ?? []) as MealRejection[])
  const prompt_fragment = buildPreferencePromptFragment(ctx)

  return NextResponse.json({ context: ctx, prompt_fragment })
}
