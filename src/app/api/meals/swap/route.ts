import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { buildPreferenceContext, buildPreferencePromptFragment } from '@/lib/meal-preferences'
import type { SwapRequest, SwapResponse, Meal, MealRejection } from '@/types/meal'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: SwapRequest = await req.json()
  const { meal, day_index, meal_slot, reason } = body

  // Persist the rejection
  const { data: rejection, error: rejectionError } = await supabase
    .from('meal_rejections')
    .insert({
      user_id: user.id,
      meal_name: meal.name,
      rejection_reason: reason,
      cuisine_tags: meal.cuisine_tags,
      ingredient_tags: meal.ingredient_tags,
    })
    .select()
    .single()

  if (rejectionError) {
    return NextResponse.json({ error: 'Failed to save rejection' }, { status: 500 })
  }

  // Load full rejection history for preference context
  const { data: allRejections } = await supabase
    .from('meal_rejections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const prefCtx = buildPreferenceContext((allRejections ?? []) as MealRejection[])
  const prefFragment = buildPreferencePromptFragment(prefCtx)

  const mealSlotLabel = meal_slot.charAt(0).toUpperCase() + meal_slot.slice(1)
  const reasonLabels: Record<string, string> = {
    dietary_issue: 'a dietary issue',
    dislike: "not liking it",
    too_complex: 'being too complex to make',
    too_expensive: 'being too expensive',
  }

  const prompt = `You are a meal planning assistant. A user has rejected their ${mealSlotLabel} meal (day ${day_index + 1}) due to ${reasonLabels[reason] ?? reason}.

Rejected meal: ${meal.name}
Description: ${meal.description}
Prep time: ${meal.prep_time_minutes} minutes
Estimated cost: $${(meal.estimated_cost_cents / 100).toFixed(2)}

${prefFragment ? `User preferences to respect:\n${prefFragment}\n` : ''}
Suggest exactly 3 alternative ${mealSlotLabel.toLowerCase()} meals. Each must be:
- Different from the rejected meal and from each other
- Appropriate for ${mealSlotLabel.toLowerCase()}
- Realistic to prepare at home

Return ONLY a JSON array of 3 meal objects. Each object must have:
{
  "name": string,
  "description": string (1-2 sentences),
  "estimated_cost_cents": number (in cents, integer),
  "prep_time_minutes": number (integer),
  "cuisine_tags": string[] (e.g. ["Italian", "Mediterranean"]),
  "ingredient_tags": string[] (key ingredients, e.g. ["chicken", "pasta", "tomato"])
}

Return only the JSON array, no other text.`

  let alternatives: Meal[]
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: 'You are a meal planning assistant. Return only valid JSON, no markdown or explanation.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    alternatives = JSON.parse(content.text)
    if (!Array.isArray(alternatives) || alternatives.length !== 3) {
      throw new Error('Expected array of 3 meals')
    }
  } catch (err) {
    console.error('Claude swap generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate alternatives' }, { status: 500 })
  }

  const response: SwapResponse = {
    alternatives,
    rejection_id: rejection.id,
  }

  return NextResponse.json(response)
}
