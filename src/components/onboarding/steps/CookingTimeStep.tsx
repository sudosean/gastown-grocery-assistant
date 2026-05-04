'use client'

import { COOKING_TIME_OPTIONS } from '@/types/household'

interface FormData {
  cooking_time_per_meal_minutes: number
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

export default function CookingTimeStep({ form, update }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Cooking time per meal</h2>
      <p className="text-sm text-gray-500 mb-6">How much time do you typically have on a weeknight?</p>
      <div className="flex flex-col gap-2">
        {COOKING_TIME_OPTIONS.map(({ value, label }) => {
          const selected = form.cooking_time_per_meal_minutes === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => update({ cooking_time_per_meal_minutes: value })}
              className={`flex items-center justify-between px-4 py-4 rounded-xl border-2 transition ${
                selected
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <span className={`text-sm font-medium ${selected ? 'text-emerald-700' : 'text-gray-700'}`}>
                {label}
              </span>
              {selected && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
