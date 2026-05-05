import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/plan', label: 'Plan', icon: '📅' },
  { href: '/pantry', label: 'Pantry', icon: '🥫' },
  { href: '/shopping', label: 'Shopping', icon: '🛒' },
]

export default function Navigation() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-brand-600 text-lg">
            🥗 Grocery Assistant
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex">
          {navItems.map(({ href, label, icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                to={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive ? 'text-brand-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop side nav */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-gray-200 p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
