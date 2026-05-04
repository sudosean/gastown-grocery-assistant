import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { MealRejection, MealPreferenceContext, MealRejectionReason } from '@/types/meal'

export async function getMealRejections(): Promise<MealRejection[]> {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('meal_rejections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

export function buildPreferenceContext(rejections: MealRejection[]): MealPreferenceContext {
  const rejectedMealNames = [...new Set(rejections.map(r => r.meal_name))]

  // Weight tags by frequency — tags appearing in multiple rejections signal stronger aversion
  const cuisineTagCounts = new Map<string, number>()
  const ingredientTagCounts = new Map<string, number>()

  for (const r of rejections) {
    for (const tag of r.cuisine_tags) {
      cuisineTagCounts.set(tag, (cuisineTagCounts.get(tag) ?? 0) + 1)
    }
    for (const tag of r.ingredient_tags) {
      ingredientTagCounts.set(tag, (ingredientTagCounts.get(tag) ?? 0) + 1)
    }
  }

  // Only surface tags rejected 2+ times to avoid over-filtering from one bad day
  const rejectedCuisineTags = [...cuisineTagCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag)

  const rejectedIngredientTags = [...ingredientTagCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([tag]) => tag)

  const rejectionReasons = [...new Set(rejections.map(r => r.rejection_reason))] as MealRejectionReason[]

  return {
    rejected_meal_names: rejectedMealNames,
    rejected_cuisine_tags: rejectedCuisineTags,
    rejected_ingredient_tags: rejectedIngredientTags,
    rejection_reasons: rejectionReasons,
  }
}

export function buildPreferencePromptFragment(ctx: MealPreferenceContext): string {
  const lines: string[] = []

  if (ctx.rejected_meal_names.length > 0) {
    lines.push(`Do NOT suggest these meals the user has previously rejected: ${ctx.rejected_meal_names.join(', ')}.`)
  }

  if (ctx.rejected_cuisine_tags.length > 0) {
    lines.push(`Avoid or minimize these cuisine styles the user dislikes: ${ctx.rejected_cuisine_tags.join(', ')}.`)
  }

  if (ctx.rejected_ingredient_tags.length > 0) {
    lines.push(`Avoid meals featuring these ingredients the user has rejected repeatedly: ${ctx.rejected_ingredient_tags.join(', ')}.`)
  }

  if (ctx.rejection_reasons.includes('too_complex')) {
    lines.push('Prefer simpler meals with fewer steps — the user finds complex recipes off-putting.')
  }

  if (ctx.rejection_reasons.includes('too_expensive')) {
    lines.push('Lean toward budget-friendly meals — the user has flagged cost as a concern.')
  }

  return lines.join('\n')
}
