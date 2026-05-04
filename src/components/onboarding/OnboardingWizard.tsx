'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertHouseholdProfile } from '@/lib/household'
import type { HouseholdProfile } from '@/types/household'
import HouseholdSizeStep from './steps/HouseholdSizeStep'
import DietaryPreferencesStep from './steps/DietaryPreferencesStep'
import AllergiesStep from './steps/AllergiesStep'
import BudgetStep from './steps/BudgetStep'
import CookingTimeStep from './steps/CookingTimeStep'
import CuisineStep from './steps/CuisineStep'

type FormData = Omit<HouseholdProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'onboarding_completed'>

const STEPS = [
  'Household',
  'Diet',
  'Allergies',
  'Budget',
  'Cook time',
  'Cuisines',
]

const DEFAULT_FORM: FormData = {
  num_adults: 2,
  num_children: 0,
  dietary_preferences: [],
  allergies: [],
  intolerances: [],
  weekly_budget_cents: 20000,
  cooking_time_per_meal_minutes: 30,
  preferred_cuisines: [],
}

interface Props {
  initialData?: Partial<FormData>
  isEdit?: boolean
}

export default function OnboardingWizard({ initialData, isEdit = false }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({ ...DEFAULT_FORM, ...initialData })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLast = step === STEPS.length - 1

  function update(patch: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  async function handleNext() {
    if (!isLast) {
      setStep(s => s + 1)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await upsertHouseholdProfile({ ...form, onboarding_completed: true })
      router.push('/plan')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const stepProps = { form, update }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-8 px-4 pb-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit your profile' : 'Set up your household'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update your preferences anytime.' : 'Help us personalize your meal plans.'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{STEPS[step]}</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === 0 && <HouseholdSizeStep {...stepProps} />}
          {step === 1 && <DietaryPreferencesStep {...stepProps} />}
          {step === 2 && <AllergiesStep {...stepProps} />}
          {step === 3 && <BudgetStep {...stepProps} />}
          {step === 4 && <CookingTimeStep {...stepProps} />}
          {step === 5 && <CuisineStep {...stepProps} />}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {saving ? 'Saving…' : isLast ? (isEdit ? 'Save changes' : 'Get started') : 'Continue'}
          </button>
        </div>

        {/* Skip (onboarding only) */}
        {!isEdit && (
          <button
            type="button"
            onClick={() => router.push('/plan')}
            className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
