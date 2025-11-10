import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-navy-800 shadow-lg border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <Music className="h-8 w-8 text-red-500" />
            <span className="metal-logo">
              Guitar Bud
            </span>
          </Link>

          {user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-red-400 font-bold transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                to="/songs"
                className="text-gray-300 hover:text-red-400 font-bold transition-colors duration-200"
              >
                My Songs
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-400 bg-navy-700 px-3 py-2 rounded-lg">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 font-bold transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}