import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Onboarding from '@/pages/Onboarding'
import Plan from '@/pages/Plan'
import Pantry from '@/pages/Pantry'
import Shopping from '@/pages/Shopping'
import Profile from '@/pages/Profile'
import { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pantry"
            element={
              <ProtectedRoute>
                <Pantry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping"
            element={
              <ProtectedRoute>
                <Shopping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
