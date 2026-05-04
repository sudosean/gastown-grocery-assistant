'use client'

import { BUDGET_OPTIONS } from '@/types/household'

interface FormData {
  weekly_budget_cents: number
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

export default function BudgetStep({ form, update }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Weekly grocery budget</h2>
      <p className="text-sm text-gray-500 mb-6">We&apos;ll suggest recipes and quantities that fit your budget.</p>
      <div className="grid grid-cols-2 gap-3">
        {BUDGET_OPTIONS.map(({ value, label }) => {
          const selected = form.weekly_budget_cents === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => update({ weekly_budget_cents: value })}
              className={`py-4 px-3 rounded-xl border-2 text-sm font-medium transition ${
                selected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
