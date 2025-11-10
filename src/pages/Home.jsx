import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Star, Target, CheckCircle } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy-800 via-navy-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <Music className="h-20 w-20 text-red-500 mx-auto mb-8 animate-pulse" />
            <h1 className="hero-metal-logo mb-8">
              Guitar Bud
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
              Your ultimate companion for tracking guitar songs, 
              managing brutal practice sessions, and conquering the fretboard!
            </p>
            <div className="space-x-6">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-red-500"
              >
                🎸 START LEARNING
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-black py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                SIGN IN
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-100 mb-6">
              Your 6-stringed Arsenal 🤘
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to dominate the guitar world and track your path to mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl">
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Song Vault</h3>
              <p className="text-gray-300">
                Build your epic collection with tabs, power chords, and brutal difficulty ratings.
              </p>
            </div>

            <div className="text-center bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl">
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Shred Tracker</h3>
              <p className="text-gray-300">
                Track your journey from "Want to Shred" through "Practicing" to "MASTERED!"
              </p>
            </div>

            <div className="text-center bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl">
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Practice Demon</h3>
              <p className="text-gray-300">
                Add notes, track alternate tunings, capo positions, and crushing techniques.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-navy-800 to-black py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-gray-100 mb-6">
            Ready to Unleash Your Inner Guitar God? 🤘
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join the brotherhood of guitarists crushing their goals with Guitar Bud!
          </p>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-5 px-12 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-2xl text-xl"
          >
            JOIN GUITAR BUD NOW 
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Music className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-black metal-logo">Guitar Bud</span>
          </div>
          <p className="text-gray-400 font-medium">
            © 2024 Guitar Bud. Your faithful guitar companion. Keep shredding! 
          </p>
        </div>
      </footer>
    </div>
  )
}