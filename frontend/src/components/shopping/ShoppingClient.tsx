import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { WeeklyMealPlan, GroceryList, GrocerySection, GroceryItem } from '@/types/meal-plan'

interface PantryItem {
  name: string
  quantity: number
  unit: string | null
}

interface Props {
  pantryItems: PantryItem[]
}

type CheckedState = Record<string, boolean>

export function ShoppingClient({ pantryItems }: Props) {
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null)
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [checked, setChecked] = useState<CheckedState>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('mealPlan')
    if (stored) {
      try {
        setMealPlan(JSON.parse(stored))
      } catch {
        // ignore corrupt storage
      }
    }
  }, [])

  async function handleGenerate() {
    if (!mealPlan) return
    setLoading(true)
    setError(null)
    setChecked({})

    const pantryNames = pantryItems.map((p) => p.name)

    try {
      const data = await apiClient.post<GroceryList>('/api/grocery-list', {
        mealPlan,
        pantryItems: pantryNames,
      })
      setGroceryList(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function toggleItem(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function itemKey(sectionName: string, itemName: string) {
    return `${sectionName}::${itemName}`
  }

  function buildShareText(list: GroceryList): string {
    const lines: string[] = ['🛒 Grocery List', '']
    for (const section of list.sections) {
      lines.push(`## ${section.name}`)
      for (const item of section.items) {
        const key = itemKey(section.name, item.name)
        const tick = checked[key] ? '✓ ' : '• '
        lines.push(`${tick}${item.name} — ${item.quantity}`)
      }
      lines.push('')
    }
    return lines.join('\n').trim()
  }

  async function handleCopy() {
    if (!groceryList) return
    await navigator.clipboard.writeText(buildShareText(groceryList))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalItems = groceryList?.sections.reduce((n, s) => n + s.items.length, 0) ?? 0
  const checkedCount = Object.values(checked).filter(Boolean).length

  if (!mealPlan) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="font-semibold text-gray-900 mb-2">No meal plan yet</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate a meal plan first, then come back to build your shopping list.
        </p>
        <Link to="/plan" className="btn-primary">
          Go to Meal Plan →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!groceryList ? (
        <div className="card space-y-4">
          <div>
            <p className="text-sm text-gray-700 font-medium mb-1">Meal plan ready</p>
            <p className="text-xs text-gray-500">
              {mealPlan.days.length}-day plan ·{' '}
              {pantryItems.length > 0
                ? `${pantryItems.length} pantry items will be subtracted`
                : 'no pantry items to subtract'}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span>
                Building your list…
              </>
            ) : (
              '✨ Generate shopping list'
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {checkedCount}/{totalItems} items checked off
            </p>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-secondary text-sm">
                {copied ? '✓ Copied!' : '📋 Copy list'}
              </button>
              <button
                onClick={() => { setGroceryList(null); setChecked({}) }}
                className="btn-secondary text-sm"
              >
                Regenerate
              </button>
            </div>
          </div>

          {groceryList.sections.map((section: GrocerySection) => {
            const uncheckedItems = section.items.filter(
              (item: GroceryItem) => !checked[itemKey(section.name, item.name)]
            )
            const checkedItems = section.items.filter(
              (item: GroceryItem) => checked[itemKey(section.name, item.name)]
            )

            return (
              <div key={section.name} className="card">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">{section.name}</h3>
                <ul className="space-y-2">
                  {[...uncheckedItems, ...checkedItems].map((item: GroceryItem) => {
                    const key = itemKey(section.name, item.name)
                    const isChecked = !!checked[key]
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleItem(key)}
                      >
                        <span
                          className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'border-gray-300 group-hover:border-brand-400'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={`text-sm flex-1 ${
                            isChecked ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-1">— {item.quantity}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
