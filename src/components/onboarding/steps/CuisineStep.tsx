'use client'

import { CUISINE_TYPES } from '@/types/household'

interface FormData {
  preferred_cuisines: string[]
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

export default function CuisineStep({ form, update }: Props) {
  function toggle(cuisine: string) {
    const next = form.preferred_cuisines.includes(cuisine)
      ? form.preferred_cuisines.filter(c => c !== cuisine)
      : [...form.preferred_cuisines, cuisine]
    update({ preferred_cuisines: next })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Favorite cuisines</h2>
      <p className="text-sm text-gray-500 mb-6">We'll prioritize these when building your meal plans.</p>
      <div className="grid grid-cols-3 gap-2">
        {CUISINE_TYPES.map(cuisine => {
          const selected = form.preferred_cuisines.includes(cuisine)
          return (
            <button
              key={cuisine}
              type="button"
              onClick={() => toggle(cuisine)}
              className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition text-center ${
                selected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
              }`}
            >
              {cuisine}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-gray-400">Pick as many as you like, or skip to see everything.</p>
    </div>
  )
}
