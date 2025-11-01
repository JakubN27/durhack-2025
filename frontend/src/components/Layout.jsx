import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Layout({ session }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    const cleanPath = path.split('?')[0]
    if (cleanPath === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(cleanPath)
  }

  const authedLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/matches', label: 'Matches' },
    { to: '/conversations', label: '💬 Conversations' },
    { to: '/profile', label: 'Profile' },
  ]

  const publicLinks = [
    { to: '/', label: 'Home' },
  ]

  const mobilePublicLinks = [
    ...publicLinks,
    { to: '/login', label: 'Login' },
    { to: '/login?mode=signup', label: 'Sign Up' },
  ]
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <nav className="sticky top-0 z-40 border-b border-primary-800/70 bg-primary-950/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-white">
                SkillSwap
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                {(session ? authedLinks : publicLinks).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`transition-colors ${isActive(link.to) ? 'text-primary-200' : 'text-white/70 hover:text-primary-100'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <Link
                    to="/matches"
                    className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-200"
                  >
                    View Matches
                  </Link>
                  <button onClick={handleSignOut} className="btn-ghost">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center text-sm font-semibold text-white/80 hover:text-primary-100"
                  >
                    Login
                  </Link>
                  <Link to="/login?mode=signup" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden pb-4">
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/80">
              {(session ? authedLinks : mobilePublicLinks).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full border px-3 py-1 transition ${isActive(link.to) ? 'border-primary-200 bg-primary-800 text-primary-100' : 'border-white/20 bg-white/10 hover:border-primary-200 hover:text-primary-100'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="mt-16 border-t border-primary-900/60 bg-primary-950/90">
        <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 text-sm text-white/70 md:grid-cols-3">
          <div>
            <p className="font-semibold text-white mb-2">SkillSwap</p>
            <p className="leading-relaxed">
              AI-powered skill exchange where mentors and learners team up to grow together.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Explore</p>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-primary-200">Dashboard</Link></li>
              <li><Link to="/matches" className="hover:text-primary-200">Matches</Link></li>
              <li><Link to="/profile" className="hover:text-primary-200">Profile</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Need Help?</p>
            <p className="leading-relaxed">
              Reach our support squad anytime at{' '}
              <a href="mailto:team@skillswap.ai" className="text-primary-200 hover:text-primary-100 font-semibold">team@skillswap.ai</a>
            </p>
          </div>
        </div>
        <div className="border-t border-primary-900/60 py-4">
          <p className="text-center text-xs text-white/50">© {new Date().getFullYear()} SkillSwap · Built with passion at Durhack</p>
        </div>
      </footer>
    </div>
  )
}
