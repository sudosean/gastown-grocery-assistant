import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { WeeklyMealPlan } from '@/types/meal-plan'

const client = new Anthropic()

export interface GroceryItem {
  name: string
  quantity: string
  section: string
}

export interface GrocerySection {
  name: string
  items: GroceryItem[]
}

export interface GroceryList {
  sections: GrocerySection[]
  generatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { mealPlan, pantryItems }: { mealPlan: WeeklyMealPlan; pantryItems: string[] } =
      await request.json()

    const mealSummary = mealPlan.days
      .map((d) => `${d.day}: ${d.breakfast.name}, ${d.lunch.name}, ${d.dinner.name}`)
      .join('\n')

    const pantryContext =
      pantryItems.length > 0
        ? `Pantry items already on hand (subtract these from the list): ${pantryItems.join(', ')}`
        : 'No pantry items to subtract.'

    const prompt = `You are a grocery list assistant. Given a 7-day meal plan, produce a consolidated shopping list.

Meal plan:
${mealSummary}

${pantryContext}

Instructions:
- Identify all ingredients needed for every meal
- Aggregate duplicates (e.g. 3 meals needing onions → "4 medium onions")
- Subtract pantry items the household already has
- Group remaining items by store section: Produce, Dairy & Eggs, Meat & Seafood, Grains & Pasta, Canned & Jarred, Frozen, Spices & Condiments, Other
- Only include sections that have items
- Quantities should be practical (cups, oz, lbs, units, etc.)

Return ONLY a JSON object with this structure:
{
  "sections": [
    {
      "name": "Produce",
      "items": [
        { "name": "yellow onions", "quantity": "4 medium", "section": "Produce" },
        { "name": "garlic", "quantity": "1 head", "section": "Produce" }
      ]
    }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system:
        'You are a grocery list assistant. Respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 })
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse grocery list from AI' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    const groceryList: GroceryList = {
      sections: parsed.sections ?? [],
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(groceryList)
  } catch (error) {
    console.error('Grocery list generation error:', error)
    return NextResponse.json({ error: 'Failed to generate grocery list' }, { status: 500 })
  }
}
