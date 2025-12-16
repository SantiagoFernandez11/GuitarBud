import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Star, Target, CheckCircle } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Music className="h-16 w-16 text-gray-900 mx-auto mb-6" />
            <h1 className="hero-metal-logo mb-4">Guitar Bud</h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Track songs, manage practice, and build clean, readable tabs — all in one place.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Everything you need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep your songs organized and your practice focused.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="mx-auto mb-5 w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <Star className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Song Library</h3>
              <p className="text-gray-600">Store titles, artists, difficulty, tuning, capo, and notes.</p>
            </div>

            <div className="card text-center">
              <div className="mx-auto mb-5 w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <Target className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Move songs from “Want to Learn” → “Learning” → “Mastered”.</p>
            </div>

            <div className="card text-center">
              <div className="mx-auto mb-5 w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tab Builder</h3>
              <p className="text-gray-600">Create tabs with techniques like slides, bends, and hammer-ons.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-gray-200 bg-white py-14">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">
            Ready to start?
          </h2>
          <p className="text-gray-600 mb-8">
            Create an account and build your practice system.
          </p>
          <Link to="/signup" className="btn-primary">
            Join Now
          </Link>
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Guitar Bud
      </footer>
    </div>
  )
}
