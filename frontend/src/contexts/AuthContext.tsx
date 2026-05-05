import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/api/client'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }
    apiClient
      .get<AuthUser>('/api/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const data = await apiClient.post<{ access_token: string; user: AuthUser }>(
      '/api/auth/login',
      { email, password }
    )
    localStorage.setItem('auth_token', data.access_token)
    setUser(data.user)
  }

  async function register(email: string, password: string) {
    const data = await apiClient.post<{ access_token: string; user: AuthUser }>(
      '/api/auth/register',
      { email, password }
    )
    localStorage.setItem('auth_token', data.access_token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
