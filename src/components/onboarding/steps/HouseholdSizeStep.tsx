'use client'

interface FormData {
  num_adults: number
  num_children: number
}

interface Props {
  form: FormData
  update: (patch: Partial<FormData>) => void
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <span className="text-base font-medium text-gray-800">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 text-xl font-light hover:border-emerald-500 hover:text-emerald-600 transition"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center text-xl font-semibold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 text-xl font-light hover:border-emerald-500 hover:text-emerald-600 transition"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default function HouseholdSizeStep({ form, update }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Who are you cooking for?</h2>
      <p className="text-sm text-gray-500 mb-6">We&apos;ll size portions and plan budgets accordingly.</p>
      <Counter
        label="Adults"
        value={form.num_adults}
        onChange={v => update({ num_adults: v })}
        min={1}
      />
      <Counter
        label="Children"
        value={form.num_children}
        onChange={v => update({ num_children: v })}
      />
    </div>
  )
}
