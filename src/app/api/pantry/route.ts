import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Support adding a single item or an array of items
  const items = Array.isArray(body) ? body : [body]

  const toInsert = items.map((item: {
    name: string
    quantity: number
    unit?: string | null
    category?: string | null
    expiry_date?: string | null
  }) => ({
    user_id: user.id,
    name: item.name,
    quantity: item.quantity ?? 1,
    unit: item.unit ?? null,
    category: item.category ?? null,
    expiry_date: item.expiry_date ?? null,
  }))

  const { data, error } = await supabase
    .from('pantry_items')
    .insert(toInsert)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data }, { status: 201 })
}
