import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (isRegister) {
        await register(email, password)
        navigate('/onboarding', { replace: true })
      } else {
        await login(email, password)
        navigate('/plan', { replace: true })
      }
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Authentication failed',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🥗</p>
          <h1 className="text-2xl font-bold text-gray-900">Grocery Assistant</h1>
          <p className="text-gray-500 text-sm mt-2">
            {isRegister ? 'Create your account' : 'Sign in to manage your meals'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {message && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setMessage(null) }}
            className="text-brand-600 hover:underline font-medium"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
