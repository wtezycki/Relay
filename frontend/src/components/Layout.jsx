import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Activity, Target, BarChart2, Shield, LogOut, Trophy } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

function Layout({ children }) {
  const location = useLocation()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  const navLinks = [
    { name: 'Feed', path: '/', icon: Activity },
    { name: 'Wyzwania', path: '/challenges', icon: Target },
    { name: 'Ranking', path: '/leaderboard', icon: Trophy },
    { name: 'Statystyki', path: '/stats', icon: BarChart2 },
  ]

  if (isAdmin) {
    navLinks.push({ name: 'Panel Admina', path: '/admin', icon: Shield })
  }

  useEffect(() => {
    const currentLink = navLinks.find(link => link.path === location.pathname)
    let pageTitle = ''

    if (currentLink) {
      pageTitle = currentLink.name
    } else if (location.pathname === '/profile') {
      pageTitle = 'Mój Profil'
    } else if (location.pathname.startsWith('/profile/')) {
      pageTitle = 'Profil'
    }

    document.title = pageTitle ? `Relay | ${pageTitle}` : 'Relay'
  }, [location.pathname, navLinks])

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-glow"></div>
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel m-4 flex flex-col border-white/5 z-10 shrink-0 md:h-[calc(100vh-32px)] md:sticky md:top-4">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-glow">
            <img src="/relay_logo.png" alt="Relay" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">Relay</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(255,87,34,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {isAuthenticated && (
          <div className="p-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                  <span className="text-gray-400 font-bold">{user?.firstName?.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">Streak: 🔥 {user?.consistencyStreak || 0}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj się
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default Layout
