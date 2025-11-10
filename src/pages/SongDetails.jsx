import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Edit, Trash2, AlertCircle, Music } from 'lucide-react'

export default function SongDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSong()
  }, [id])

  const fetchSong = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      setSong(data)
    } catch (error) {
      console.error('Error fetching song:', error)
      setError('Song not found')
    } finally {
      setLoading(false)
    }
  }

  const deleteSong = async () => {
    if (!window.confirm('Are you sure you want to delete this song from your arsenal?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      navigate('/songs')
    } catch (error) {
      console.error('Error deleting song:', error)
      setError('Failed to delete song')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'want_to_learn':
        return <div className="h-4 w-4 bg-yellow-500 rounded-full" title="Want to Learn" />
      case 'practicing':
        return <div className="h-4 w-4 bg-blue-500 rounded-full" title="Learning" />
      case 'learned':
        return <div className="h-4 w-4 bg-green-500 rounded-full" title="Mastered" />
      default:
        return <div className="h-4 w-4 bg-gray-500 rounded-full" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'want_to_learn':
        return 'Want to Learn'
      case 'practicing':
        return 'Learning'
      case 'learned':
        return 'Mastered'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'want_to_learn':
        return 'border-yellow-500 text-yellow-400 bg-yellow-900/20'
      case 'practicing':
        return 'border-blue-500 text-blue-400 bg-blue-900/20'
      case 'learned':
        return 'border-green-500 text-green-400 bg-green-900/20'
      default:
        return 'border-gray-500 text-gray-400 bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
        <div className="text-center py-16">
          <div className="card max-w-lg mx-auto">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-100 mb-2">Song Not Found</h3>
            <p className="text-lg text-gray-400 mb-6">{error || 'The song you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => navigate('/songs')}
              className="btn-primary"
            >
              Back to Arsenal
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => navigate('/songs')}
          className="flex items-center text-gray-400 hover:text-red-400 mb-6 font-bold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Arsenal
        </button>
      </div>

      <div className="card">
        {/* Header with song info and actions */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start space-x-6">
            {getStatusIcon(song.status)}
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">{song.title}</h1>
              <p className="text-2xl text-gray-400 font-medium mb-4">{song.artist}</p>
              
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 text-sm font-bold rounded-full border ${getStatusColor(song.status)}`}>
                  {getStatusText(song.status)}
                </span>
                {song.difficulty && (
                  <span className="px-4 py-2 text-sm font-bold rounded-full border border-yellow-500 text-yellow-400 bg-yellow-900/20">
                    🔥 Difficulty: {song.difficulty}/10
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              to={`/songs/${song.id}/edit`}
              className="p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-all duration-200 border border-gray-600 hover:border-blue-500"
            >
              <Edit className="h-5 w-5 text-gray-300 hover:text-white" />
            </Link>
            <button
              onClick={deleteSong}
              className="p-3 bg-gray-700 hover:bg-red-600 rounded-lg transition-all duration-200 border border-gray-600 hover:border-red-500"
            >
              <Trash2 className="h-5 w-5 text-gray-300 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Song Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {song.capo !== null && song.capo !== undefined && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Capo Position</h3>
              <p className="text-lg font-medium text-gray-100">
                {song.capo === 0 ? 'No Capo' : `Fret ${song.capo}`}
              </p>
            </div>
          )}

          {song.tuning && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">🎵 Tuning</h3>
              <p className="text-lg font-medium text-gray-100">{song.tuning}</p>
            </div>
          )}

          {song.difficulty && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Difficulty</h3>
              <p className="text-lg font-medium text-yellow-400 font-bold">🔥 {song.difficulty}/10</p>
            </div>
          )}
        </div>

        {/* Chords Section */}
        {song.chords && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-100 mb-4">🎸 Chords & Progressions</h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300 font-mono text-lg leading-relaxed whitespace-pre-wrap">
                {song.chords}
              </p>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {song.notes && (
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-4">📝 Practice Notes & Techniques</h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {song.notes}
              </p>
            </div>
          </div>
        )}

        {/* Empty state if no additional details */}
        {!song.chords && !song.notes && !song.capo && !song.tuning && !song.difficulty && (
          <div className="text-center py-8">
            <Music className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400">No additional details available for this song.</p>
            <Link
              to={`/songs/${song.id}/edit`}
              className="text-blue-400 hover:text-blue-300 font-medium mt-2 inline-block"
            >
              Add some details →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}