import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Music, Plus, Clock, CheckCircle, Target } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSongs: 0,
    learnedSongs: 0,
    practicingSongs: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total songs count
      const { count: totalSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch learned songs count
      const { count: learnedSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'learned')

      // Fetch practicing songs count
      const { count: practicingSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'practicing')

      // Fetch recent songs for activity
      const { data: recentSongs } = await supabase
        .from('songs')
        .select('title, artist, status, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)

      setStats({
        totalSongs: totalSongs || 0,
        learnedSongs: learnedSongs || 0,
        practicingSongs: practicingSongs || 0,
        recentActivity: recentSongs || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-2"> Guitar Dashboard</h1>
        <p className="text-xl text-gray-400">
          Welcome back! Here's your strumming progress. 🎸
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-red-400">Total Songs</p>
              <p className="text-3xl font-black text-gray-100">{stats.totalSongs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-green-400">Mastered</p>
              <p className="text-3xl font-black text-gray-100">{stats.learnedSongs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-yellow-400">Learning</p>
              <p className="text-3xl font-black text-gray-100">{stats.practicingSongs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
            <Target className="h-6 w-6 text-red-500 mr-2" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link
              to="/songs/new"
              className="flex items-center p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 border border-red-500"
            >
              <Plus className="h-6 w-6 text-white mr-4" />
              <span className="font-bold text-white text-lg"> Add New Song</span>
            </Link>
            <Link
              to="/songs"
              className="flex items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 border border-gray-600"
            >
              <Music className="h-6 w-6 text-gray-300 mr-4" />
              <span className="font-bold text-gray-100 text-lg">View Song Arsenal</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
            <Clock className="h-6 w-6 text-yellow-500 mr-2" />
            Recent Practice
          </h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((song, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-xl border border-gray-600">
                  <div>
                    <p className="font-bold text-gray-100">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                      song.status === 'learned' 
                        ? 'status-learned'
                        : song.status === 'practicing'
                        ? 'status-practicing'
                        : 'status-want-to-learn'
                    }`}>
                      {song.status === 'learned' ? ' MASTERED' : 
                       song.status === 'practicing' ? ' LEARNING' : 'WANT TO LEARN'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-700 rounded-xl border border-gray-600">
              <Music className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400 font-medium text-lg">
                No songs in your arsenal yet!
              </p>
              <p className="text-gray-500 mt-2">
                Start by adding your first masterpiece!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}