import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { SwapMealRequest, Meal } from '@/types/meal-plan'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const body: SwapMealRequest = await request.json()
    const { day, mealType, currentMeal, householdSize, dietaryRestrictions, dislikedMeal } = body

    const dietaryContext = dietaryRestrictions.length > 0
      ? `Dietary restrictions/allergies: ${dietaryRestrictions.join(', ')}.`
      : 'No dietary restrictions.'

    const prompt = `Suggest a replacement ${mealType} meal for ${day}.

Context:
- Household size: ${householdSize}
- ${dietaryContext}
- Current meal to replace: "${currentMeal.name}" (user disliked: ${dislikedMeal})
- Target cost: ~$${currentMeal.estimatedCost} (similar budget)
- Target prep time: ~${currentMeal.prepTime} minutes

Return a JSON object:
{
  "name": "meal name",
  "description": "brief description (1-2 sentences)",
  "estimatedCost": 8.00,
  "prepTime": 20
}

The replacement must:
- Be different from "${dislikedMeal}"
- Respect all dietary restrictions
- Be a ${mealType} appropriate for the time of day
- Have similar cost and prep time as the original

Return ONLY the JSON object, no other text.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: 'You are a professional meal planner. Suggest practical alternative meals. Always respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format from AI' }, { status: 500 })
    }

    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse meal from AI response' }, { status: 500 })
    }

    const meal: Meal = JSON.parse(jsonMatch[0])
    return NextResponse.json(meal)
  } catch (error) {
    console.error('Meal swap error:', error)
    return NextResponse.json({ error: 'Failed to swap meal' }, { status: 500 })
  }
}
