import { useState } from 'react'
import { apiClient } from '@/api/client'
import type { Meal, MealRejectionReason, SwapRequest, SwapResponse } from '@/types/meal'
import { REJECTION_REASON_LABELS } from '@/types/meal'

interface MealSwapModalProps {
  meal: Meal
  dayIndex: number
  mealSlot: 'breakfast' | 'lunch' | 'dinner'
  onConfirm: (replacement: Meal) => void
  onClose: () => void
}

export function MealSwapModal({ meal, dayIndex, mealSlot, onConfirm, onClose }: MealSwapModalProps) {
  const [step, setStep] = useState<'reason' | 'alternatives'>('reason')
  const [selectedReason, setSelectedReason] = useState<MealRejectionReason | null>(null)
  const [alternatives, setAlternatives] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchAlternatives(reason: MealRejectionReason) {
    setLoading(true)
    setError(null)
    try {
      const req: SwapRequest = { meal, day_index: dayIndex, meal_slot: mealSlot, reason }
      const data = await apiClient.post<SwapResponse>('/api/meals/swap', req)
      setAlternatives(data.alternatives)
      setStep('alternatives')
    } catch {
      setError('Could not load alternatives. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReasonSelect(reason: MealRejectionReason) {
    setSelectedReason(reason)
    fetchAlternatives(reason)
  }

  const reasons = Object.entries(REJECTION_REASON_LABELS) as [MealRejectionReason, string][]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Swap meal</h2>
            <p className="text-sm text-gray-500 mt-0.5">{meal.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'reason' && (
          <>
            <p className="text-sm text-gray-600 mb-4">Why do you want to swap this meal?</p>
            <div className="space-y-2">
              {reasons.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleReasonSelect(value)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'alternatives' && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray-500">Finding alternatives…</span>
              </div>
            )}
            {error && (
              <div className="py-4">
                <p className="text-sm text-red-600 mb-3">{error}</p>
                <button
                  onClick={() => selectedReason && fetchAlternatives(selectedReason)}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            {!loading && !error && alternatives.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-3">Choose a replacement:</p>
                <div className="space-y-3">
                  {alternatives.map((alt, i) => (
                    <button
                      key={i}
                      onClick={() => onConfirm(alt)}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">{alt.name}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{alt.description}</div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        <span>{alt.prep_time_minutes} min</span>
                        <span>${(alt.estimated_cost_cents / 100).toFixed(2)}</span>
                        {alt.cuisine_tags.length > 0 && <span>{alt.cuisine_tags[0]}</span>}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep('reason')}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-center"
                >
                  Pick a different reason
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
