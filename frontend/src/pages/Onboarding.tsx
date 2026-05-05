import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default function Onboarding() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    apiClient
      .get<{ onboarding_completed?: boolean }>('/api/profile')
      .then((profile) => {
        if (profile?.onboarding_completed) navigate('/plan', { replace: true })
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [navigate])

  if (checking) return null

  return <OnboardingWizard />
}
