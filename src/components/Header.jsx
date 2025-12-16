import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <Music className="h-7 w-7 text-gray-900" />
            <span className="metal-logo">Guitar Bud</span>
          </Link>

          {user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-150"
              >
                Dashboard
              </Link>
              <Link
                to="/songs"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-150"
              >
                My Songs
              </Link>

              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 px-3 py-2 rounded-md">
                <User className="h-4 w-4 text-gray-600" />
                <span className="truncate max-w-[220px]">{user.email}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-150"
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
