export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  household_size: number | null
  dietary_preferences: string[]
  created_at: string
  updated_at: string
}

export interface PantryItem {
  id: string
  user_id: string
  name: string
  quantity: number
  unit: string | null
  category: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  name: string
  quantity: number
  unit: string | null
  category: string | null
  checked: boolean
  notes: string | null
}
