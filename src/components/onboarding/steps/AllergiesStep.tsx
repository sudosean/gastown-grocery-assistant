'use client'

import { useState } from 'react'
import { COMMON_ALLERGIES, COMMON_INTOLERANCES } from '@/types/household'

interface FormData {
  allergies: string[]
  intolerances: string[]
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

function ToggleGroup({
  label,
  options,
  selected,
  onToggle,
  customInput,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  customInput: string
}) {
  const [input, setInput] = useState(customInput)

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map(opt => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                active
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      <input
        type="text"
        placeholder="Add custom (press Enter)"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim()) {
            onToggle(input.trim())
            setInput('')
          }
        }}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
      />
    </div>
  )
}

export default function AllergiesStep({ form, update }: Props) {
  function toggleAllergy(v: string) {
    const next = form.allergies.includes(v)
      ? form.allergies.filter(a => a !== v)
      : [...form.allergies, v]
    update({ allergies: next })
  }

  function toggleIntolerance(v: string) {
    const next = form.intolerances.includes(v)
      ? form.intolerances.filter(a => a !== v)
      : [...form.intolerances, v]
    update({ intolerances: next })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Allergies & intolerances</h2>
      <p className="text-sm text-gray-500 mb-5">We'll never suggest recipes containing these ingredients.</p>
      <ToggleGroup
        label="Allergies (avoid completely)"
        options={COMMON_ALLERGIES}
        selected={form.allergies}
        onToggle={toggleAllergy}
        customInput=""
      />
      <ToggleGroup
        label="Intolerances (prefer to avoid)"
        options={COMMON_INTOLERANCES}
        selected={form.intolerances}
        onToggle={toggleIntolerance}
        customInput=""
      />
    </div>
  )
}
