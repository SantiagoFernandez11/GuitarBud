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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!confirm('Delete this song?')) return
    try {
      const { error } = await supabase.from('songs').delete().eq('id', songId)
      if (error) throw error
      setSongs(songs.filter(song => song.id !== songId))
    } catch (error) {
      console.error('Error deleting song:', error)
    }
  }

  const filteredSongs = songs.filter(song => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || song.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'learned':
        return <CheckCircle className="h-5 w-5 text-gray-900" />
      case 'practicing':
        return <Clock className="h-5 w-5 text-gray-900" />
      case 'want_to_learn':
        return <Star className="h-5 w-5 text-gray-900" />
      default:
        return <Music className="h-5 w-5 text-gray-900" />
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'learned') return 'status-learned'
    if (status === 'practicing') return 'status-practicing'
    return 'status-want-to-learn'
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'learned':
        return 'Mastered'
      case 'practicing':
        return 'Learning'
      case 'want_to_learn':
        return 'Want to Learn'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
      <div className="flex justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My Songs</h1>
          <p className="mt-2 text-gray-600">Search, filter, and manage your library.</p>
        </div>

        <Link to="/songs/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Song</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search songs or artists…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="all">All Status</option>
          <option value="want_to_learn">Want to Learn</option>
          <option value="practicing">Learning</option>
          <option value="learned">Mastered</option>
        </select>
      </div>

      {/* List */}
      {filteredSongs.length > 0 ? (
        <div className="space-y-4">
          {filteredSongs.map((song) => (
            <Link key={song.id} to={`/songs/${song.id}`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(song.status)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                      <p className="text-gray-600">{song.artist}</p>

                      {song.difficulty && (
                        <p className="text-sm text-gray-600 mt-1">
                          Difficulty: {song.difficulty}/10
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(song.status)}`}>
                      {getStatusText(song.status)}
                    </span>

                    <Link
                      to={`/songs/${song.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-gray-900" />
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSong(song.id)
                      }}
                      className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-gray-900" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="card max-w-lg mx-auto">
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No songs found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Your library is empty — add a song to begin.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link to="/songs/new" className="btn-primary">
                Add your first song
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
