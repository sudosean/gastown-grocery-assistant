import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { GenerateMealPlanRequest, WeeklyMealPlan } from '@/types/meal-plan'

const client = new Anthropic()

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMealPlanRequest = await request.json()
    const { householdSize, dietaryRestrictions, weeklyBudget, maxCookingTime, pantryItems } = body

    const dietaryContext = dietaryRestrictions.length > 0
      ? `Dietary restrictions/allergies: ${dietaryRestrictions.join(', ')}.`
      : 'No dietary restrictions.'

    const pantryContext = pantryItems.length > 0
      ? `Available pantry items to incorporate: ${pantryItems.join(', ')}.`
      : 'No specific pantry items to incorporate.'

    const prompt = `Generate a personalized 7-day meal plan for a household of ${householdSize} people.

Context:
- ${dietaryContext}
- Weekly budget: $${weeklyBudget}
- Maximum cooking time per meal: ${maxCookingTime} minutes
- ${pantryContext}

Return a JSON object with this exact structure:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "meal name",
        "description": "brief description (1-2 sentences)",
        "estimatedCost": 5.50,
        "prepTime": 10
      },
      "lunch": { ... },
      "dinner": { ... }
    },
    ... (7 days total: Monday through Sunday)
  ],
  "totalEstimatedCost": 120.00
}

Requirements:
- estimatedCost is per household (not per person) in USD
- prepTime is in minutes
- Keep meals varied and practical
- Use pantry items where sensible
- Stay within the budget (totalEstimatedCost should be <= ${weeklyBudget})
- Respect all dietary restrictions strictly
- Keep prep times within the ${maxCookingTime}-minute limit

Return ONLY the JSON object, no other text.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: 'You are a professional meal planner and nutritionist. You create practical, balanced meal plans that fit household budgets and dietary needs. Always respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format from AI' }, { status: 500 })
    }

    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse meal plan from AI response' }, { status: 500 })
    }

    const mealPlanData = JSON.parse(jsonMatch[0])

    if (!mealPlanData.days || mealPlanData.days.length !== 7) {
      return NextResponse.json({ error: 'Invalid meal plan structure from AI' }, { status: 500 })
    }

    const mealPlan: WeeklyMealPlan = {
      days: DAYS.map((day, i) => ({
        day,
        breakfast: mealPlanData.days[i]?.breakfast ?? { name: 'TBD', description: '', estimatedCost: 0, prepTime: 0 },
        lunch: mealPlanData.days[i]?.lunch ?? { name: 'TBD', description: '', estimatedCost: 0, prepTime: 0 },
        dinner: mealPlanData.days[i]?.dinner ?? { name: 'TBD', description: '', estimatedCost: 0, prepTime: 0 },
      })),
      totalEstimatedCost: mealPlanData.totalEstimatedCost ?? 0,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Meal plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}
