'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({
        text: 'Check your email for a sign-in link!',
        type: 'success',
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🥗</p>
          <h1 className="text-2xl font-bold text-gray-900">Grocery Assistant</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to manage your meals</p>
        </div>

        <div className="card">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              disabled={loading || !email}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          No password needed — we&apos;ll email you a sign-in link.
        </p>
      </div>
    </div>
  )
}
