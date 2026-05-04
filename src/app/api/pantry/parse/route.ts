import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Grains & Pasta',
  'Canned & Jarred',
  'Frozen',
  'Spices & Condiments',
  'Other',
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { text } = await request.json()
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: 'You are a kitchen assistant. Parse ingredient descriptions into structured JSON. Return only valid JSON, no explanation.',
    messages: [{
      role: 'user',
      content: `Parse this text into a list of pantry items: "${text}"

Return JSON in this exact format:
{
  "items": [
    {"name": "flour", "quantity": 2, "unit": "cups", "category": "Grains & Pasta"},
    {"name": "eggs", "quantity": 6, "unit": null, "category": "Dairy & Eggs"}
  ]
}

Rules:
- name: lowercase, singular form (e.g. "egg" not "eggs")
- quantity: numeric, default 1 if vague (e.g. "some" = 1)
- unit: standard cooking unit (cups, tbsp, tsp, oz, lb, g, kg, ml) or null for countable items
- category: must be one of: ${CATEGORIES.join(', ')}`,
    }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(responseText)
    return NextResponse.json({ items: parsed.items })
  } catch {
    return NextResponse.json({ error: 'Failed to parse ingredients' }, { status: 500 })
  }
}
