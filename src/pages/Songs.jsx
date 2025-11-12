import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, Search, Music, Clock, CheckCircle, Star, Trash2, Edit } from 'lucide-react'

export default function Songs() {
  const { user } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSongs(data || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSong = async (songId) => {
    if (!confirm('🤘 Are you sure you want to remove this song from your arsenal?')) return

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)

      if (error) throw error
      setSongs(songs.filter(song => song.id !== songId))
    } catch (error) {
      console.error('Error deleting song:', error)
    }
  }

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || song.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'learned':
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case 'practicing':
        return <Clock className="h-6 w-6 text-yellow-400" />
      case 'want_to_learn':
        return <Star className="h-6 w-6 text-blue-400" />
      default:
        return <Music className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'learned':
        return 'status-learned'
      case 'practicing':
        return 'status-practicing'
      case 'want_to_learn':
        return 'status-want-to-learn'
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'learned':
        return '🎯 MASTERED'
      case 'practicing':
        return '🔥 SHREDDING'
      case 'want_to_learn':
        return '⭐ WANT TO SHRED'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-100 flex items-center">
            My Guitar Arsenal
          </h1>
          <p className="mt-2 text-xl text-gray-400 font-medium">
            Manage your collection of epic songs
          </p>
        </div>
        <Link
          to="/songs/new"
          className="btn-primary flex items-center space-x-2 text-lg"
        >
          <Plus className="h-6 w-6" />
          <span>🎸 Add Song</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="want_to_learn">Want to Shred</option>
          <option value="practicing">Shredding</option>
          <option value="learned">Mastered</option>
        </select>
      </div>

      {/* Songs List */}
      {filteredSongs.length > 0 ? (
        <div className="space-y-6">
          {filteredSongs.map((song) => (
            <Link key={song.id} to={`/songs/${song.id}`} className="block">
              <div className="card hover:shadow-2xl transition-all duration-200 hover:border-gray-500 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {getStatusIcon(song.status)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 hover:text-blue-400 transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-lg text-gray-400 font-medium">{song.artist}</p>
                      {song.difficulty && (
                        <p className="text-sm text-yellow-400 font-bold mt-1">
                          🔥 Difficulty: {song.difficulty}/10
                        </p>
                      )}
                      {song.chords && (
                        <p className="text-sm text-blue-400 mt-1">
                          🎸 Chords: {song.chords}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getStatusColor(song.status)}`}>
                      {getStatusText(song.status)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/songs/${song.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-all duration-200 border border-gray-600 hover:border-blue-500"
                      >
                        <Edit className="h-5 w-5 text-gray-300 hover:text-white" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSong(song.id)
                        }}
                        className="p-3 bg-gray-700 hover:bg-red-600 rounded-lg transition-all duration-200 border border-gray-600 hover:border-red-500"
                      >
                        <Trash2 className="h-5 w-5 text-gray-300 hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="card max-w-lg mx-auto">
            <Music className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-100 mb-2">No Songs Found</h3>
            <p className="text-lg text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter.' 
                : 'Your song arsenal is empty. Time to add some songs!'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link to="/songs/new" className="btn-primary text-lg">
                Add Your First Song
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}