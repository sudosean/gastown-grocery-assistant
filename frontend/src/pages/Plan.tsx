import MealPlanGenerator from '@/components/MealPlanGenerator'

export default function Plan() {
  return (
    <div className="pb-20 md:pb-0 md:pl-56">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
          <p className="text-gray-500 text-sm mt-1">Generate your personalized weekly meal plan</p>
        </div>
        <MealPlanGenerator />
      </div>
    </div>
  )
}
