import { Outlet, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Layout({ session }) {
  const navigate = useNavigate()
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                SkillSwap
              </Link>
              {session && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link to="/matches" className="text-gray-700 hover:text-primary-600">
                    Matches
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                    Profile
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center">
              {session ? (
                <button onClick={handleSignOut} className="btn-secondary">
                  Sign Out
                </button>
              ) : (
                <Link to="/login" className="btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          © 2025 SkillSwap - AI-Powered Skill Exchange
        </div>
      </footer>
    </div>
  )
}
