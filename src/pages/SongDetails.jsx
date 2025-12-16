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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // ✅ Parse tab_data so we can render it
      const parsed = {
        ...data,
        tab_data: data?.tab_data ? JSON.parse(data.tab_data) : null
      }

      setSong(parsed)
    } catch (error) {
      console.error('Error fetching song:', error)
      setError('Song not found')
    } finally {
      setLoading(false)
    }
  }

  const deleteSong = async () => {
    if (!window.confirm('Delete this song?')) return

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

  const getStatusBadge = (status) => {
    if (status === 'learned') return 'status-learned'
    if (status === 'practicing') return 'status-practicing'
    return 'status-want-to-learn'
  }

  // Read-only tab preview (same idea as SongForm preview)
  const renderTabPreview = () => {
    const tabData = song?.tab_data
    if (!tabData?.tab?.lines?.length) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <Music className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium">No tabs added yet.</p>
          <Link
            to={`/songs/${song.id}/edit`}
            className="text-gray-900 font-medium hover:underline mt-2 inline-block"
          >
            Add tabs →
          </Link>
        </div>
      )
    }

    const { tab } = tabData
    const maxLength = Math.max(
      ...tab.lines.map(line => (line.notes ? line.notes.length : 0)),
      tab.chords ? tab.chords.length : 0,
      10
    )

    // Calculate per-position width for alignment
    const positionWidths = []
    for (let pos = 0; pos < maxLength; pos++) {
      let maxWidth = 1
      tab.lines.forEach(line => {
        if (line.notes && line.notes[pos]) {
          const note = line.notes[pos]
          if (typeof note === 'string' && note !== '-') {
            maxWidth = Math.max(maxWidth, note.length)
          }
        }
      })
      if (tab.chords && tab.chords[pos] && typeof tab.chords[pos] === 'string') {
        maxWidth = Math.max(maxWidth, tab.chords[pos].length)
      }
      positionWidths[pos] = maxWidth
    }

    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="font-mono text-xs overflow-x-auto">
          {/* Chords row (optional) */}
          {tab.chords && tab.chords.some(chord => chord && chord.trim()) && (
            <div className="text-gray-200 mb-1 whitespace-pre">
              {' '.repeat(2)}
              {Array.from({ length: maxLength }, (_, i) => {
                const chord = tab.chords[i] || ''
                const width = positionWidths[i] || 1
                return (typeof chord === 'string' ? chord : '').padEnd(width + 1, ' ')
              }).join('')}
            </div>
          )}

          {/* Strings */}
          {tab.lines.map((line, stringIndex) => (
            <div key={stringIndex} className="whitespace-pre">
              <span className="text-gray-200">{line.string}</span>
              <span className="text-gray-400">|</span>
              {Array.from({ length: maxLength }, (_, i) => {
                const note = line.notes && line.notes[i] ? line.notes[i] : '-'
                const width = positionWidths[i] || 1
                const noteStr = typeof note === 'string' ? note : '-'
                return (
                  <span key={i} className={noteStr !== '-' ? 'text-gray-100' : 'text-gray-500'}>
                    {noteStr.padEnd(width + 1, '-')}
                  </span>
                )
              })}
              <span className="text-gray-400">|</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 mt-3">
          Preview only — edit to change.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900" />
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
        <div className="text-center py-16">
          <div className="card max-w-lg mx-auto">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-900 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Song not found</h3>
            <p className="text-gray-600 mb-6">{error || 'This song does not exist.'}</p>
            <button onClick={() => navigate('/songs')} className="btn-primary">
              Back to Songs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/songs')}
        className="flex items-center text-gray-700 hover:text-gray-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Songs
      </button>

      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">{song.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{song.artist}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(song.status)}`}>
                {getStatusText(song.status)}
              </span>

              {song.difficulty && (
                <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 bg-gray-100 text-gray-800">
                  Difficulty: {song.difficulty}/10
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/songs/${song.id}/edit`}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4 text-gray-900" />
            </Link>
            <button
              onClick={deleteSong}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {song.capo !== null && song.capo !== undefined && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Capo</h3>
              <p className="text-gray-900">{song.capo === 0 ? 'No capo' : `Fret ${song.capo}`}</p>
            </div>
          )}

          {song.tuning && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Tuning</h3>
              <p className="text-gray-900">{song.tuning}</p>
            </div>
          )}

          {song.difficulty && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Difficulty</h3>
              <p className="text-gray-900">{song.difficulty}/10</p>
            </div>
          )}
        </div>

        {/* ✅ Tabs section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Tabs</h3>
            <Link to={`/songs/${song.id}/edit`} className="text-gray-900 font-medium hover:underline">
              Edit tabs →
            </Link>
          </div>
          {renderTabPreview()}
        </div>

        {/* Chords */}
        {song.chords && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Chords</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 font-mono whitespace-pre-wrap">{song.chords}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {song.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">{song.notes}</p>
            </div>
          </div>
        )}

        {!song.chords && !song.notes && !song.capo && !song.tuning && !song.difficulty && !song?.tab_data && (
          <div className="text-center py-10">
            <Music className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600">No additional details yet.</p>
            <Link to={`/songs/${song.id}/edit`} className="text-gray-900 font-medium hover:underline mt-2 inline-block">
              Add details →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
