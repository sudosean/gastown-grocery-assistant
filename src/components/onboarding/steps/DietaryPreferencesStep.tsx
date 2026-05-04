'use client'

import { DIETARY_PREFERENCES, type DietaryPreference } from '@/types/household'

interface FormData {
  dietary_preferences: DietaryPreference[]
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

export default function DietaryPreferencesStep({ form, update }: Props) {
  function toggle(value: DietaryPreference) {
    const current = form.dietary_preferences
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    update({ dietary_preferences: next })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Dietary preferences</h2>
      <p className="text-sm text-gray-500 mb-6">Select all that apply. We'll filter recipes accordingly.</p>
      <div className="flex flex-wrap gap-2">
        {DIETARY_PREFERENCES.map(({ value, label }) => {
          const selected = form.dietary_preferences.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                selected
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-gray-400">Leave blank if no restrictions apply.</p>
    </div>
  )
}
