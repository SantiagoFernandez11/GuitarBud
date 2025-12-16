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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      const { count: totalSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: learnedSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'learned')

      const { count: practicingSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'practicing')

      const { data: recentSongs } = await supabase
        .from('songs')
        .select('id, title, artist, status, updated_at')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const statusLabel = (s) =>
    s === 'learned' ? 'Mastered' : s === 'practicing' ? 'Learning' : 'Want to Learn'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
          Guitar Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back — here’s your progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <Music className="h-7 w-7 text-gray-900" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Songs</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.totalSongs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <CheckCircle className="h-7 w-7 text-gray-900" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mastered</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.learnedSongs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <Clock className="h-7 w-7 text-gray-900" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Learning</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.practicingSongs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
            <Target className="h-5 w-5 text-gray-900 mr-2" />
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link to="/songs/new" className="block">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-gray-900 mr-3" />
                  <span className="font-medium text-gray-900">Add New Song</span>
                </div>
                <span className="text-sm text-gray-500">Create</span>
              </div>
            </Link>

            <Link to="/songs" className="block">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Music className="h-5 w-5 text-gray-900 mr-3" />
                  <span className="font-medium text-gray-900">View Songs</span>
                </div>
                <span className="text-sm text-gray-500">Browse</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
            <Clock className="h-5 w-5 text-gray-900 mr-2" />
            Recent Activity
          </h2>

          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((song) => (
                <Link key={song.id} to={`/songs/${song.id}`} className="block">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{song.title}</p>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                    </div>
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full border status-want-to-learn">
                      {statusLabel(song.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <Music className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium">No songs yet.</p>
              <p className="text-sm text-gray-500 mt-1">Add your first one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
