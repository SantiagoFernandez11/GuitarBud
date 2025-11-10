import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, AlertCircle, ChevronDown, ChevronUp, Music } from 'lucide-react'
import GuitarTabEditor from '../components/GuitarTabEditor'

export default function SongForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    status: 'want_to_learn',
    difficulty: '',
    notes: '',
    chords: '',
    capo: '',
    tuning: 'Standard',
    tab_data: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTabEditor, setShowTabEditor] = useState(false)

  useEffect(() => {
    if (isEditing) {
      fetchSong()
    }
  }, [id, isEditing])

  const fetchSong = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setFormData({
          title: data.title || '',
          artist: data.artist || '',
          status: data.status || 'want_to_learn',
          difficulty: data.difficulty || '',
          notes: data.notes || '',
          chords: data.chords || '',
          capo: data.capo || '',
          tuning: data.tuning || 'Standard',
          tab_data: data.tab_data ? JSON.parse(data.tab_data) : null
        })
        
        // Open tab editor if there's existing tab data
        if (data.tab_data) {
          setShowTabEditor(true)
        }
      }
    } catch (error) {
      console.error('Error fetching song:', error)
      setError('Song not found')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const songData = {
        ...formData,
        user_id: user.id,
        difficulty: formData.difficulty ? parseInt(formData.difficulty) : null,
        capo: formData.capo ? parseInt(formData.capo) : null,
        tab_data: formData.tab_data ? JSON.stringify(formData.tab_data) : null,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error } = await supabase
          .from('songs')
          .update(songData)
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        songData.created_at = new Date().toISOString()
        const { error } = await supabase
          .from('songs')
          .insert([songData])

        if (error) throw error
      }

      navigate('/songs')
    } catch (error) {
      console.error('Error saving song:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTabSave = (tabData) => {
    setFormData(prev => ({
      ...prev,
      tab_data: tabData
    }))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-navy-900 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => navigate('/songs')}
          className="flex items-center text-gray-400 hover:text-red-400 mb-6 font-bold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Arsenal
        </button>
        <h1 className="text-4xl font-bold text-gray-100">
          {isEditing ? '🔧 Edit Song' : 'Add New Song'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="flex items-center space-x-2 text-red-100 bg-red-900 p-4 rounded-lg border border-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-300 mb-2">
                🎵 Song Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter epic song title"
              />
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-bold text-gray-300 mb-2">
                Artist/Band *
              </label>
              <input
                type="text"
                name="artist"
                id="artist"
                required
                value={formData.artist}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter artist or band name"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-bold text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="want_to_learn">Want to Learn</option>
                <option value="practicing">Learning</option>
                <option value="learned">Mastered</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-bold text-gray-300 mb-2">
                Difficulty (1-10)
              </label>
              <input
                type="number"
                name="difficulty"
                id="difficulty"
                min="1"
                max="10"
                value={formData.difficulty}
                onChange={handleChange}
                className="input-field"
                placeholder="Rate the brutality"
              />
            </div>

            <div>
              <label htmlFor="capo" className="block text-sm font-bold text-gray-300 mb-2">
                Capo Position
              </label>
              <input
                type="number"
                name="capo"
                id="capo"
                min="0"
                max="12"
                value={formData.capo}
                onChange={handleChange}
                className="input-field"
                placeholder="Capo fret (0 for no capo)"
              />
            </div>

            <div>
              <label htmlFor="tuning" className="block text-sm font-bold text-gray-300 mb-2">
                🎵 Tuning
              </label>
              <select
                name="tuning"
                id="tuning"
                value={formData.tuning}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Standard">Standard (E-A-D-G-B-E)</option>
                <option value="Drop D">Drop D (D-A-D-G-B-E)</option>
                <option value="Half Step Down">Half Step Down</option>
                <option value="Open G">Open G</option>
                <option value="Open D">Open D</option>
                <option value="DADGAD">DADGAD</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="chords" className="block text-sm font-bold text-gray-300 mb-2">
              Chords & Progressions
            </label>
            <textarea
              name="chords"
              id="chords"
              rows={3}
              value={formData.chords}
              onChange={handleChange}
              className="input-field"
              placeholder="List the main chords used (e.g., Em, C, G, D - or power chords E5, A5, D5)"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-bold text-gray-300 mb-2">
              Practice Notes & Techniques
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              placeholder="Add notes about techniques, solos, riffs, or practice tips..."
            />
          </div>
        </div>

        {/* Interactive Tab Editor Section */}
        <div className="card">
          <button
            type="button"
            onClick={() => setShowTabEditor(!showTabEditor)}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold text-gray-100">Interactive Tab Editor</h3>
              {formData.tab_data && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Has Tabs
                </span>
              )}
            </div>
            {showTabEditor ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {showTabEditor && (
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400 mb-4">
                Create interactive guitar tabs for your song. Click on the fretboard to add notes, 
                right-click to remove them.
              </p>
              <GuitarTabEditor 
                songId={id}
                initialTabData={formData.tab_data}
                onSave={handleTabSave}
                embedded={true}
              />
            </div>
          )}
          
          {!showTabEditor && (
            <p className="text-gray-400 text-sm">
              Click to open the interactive tab editor and create guitar tablature for your song.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/songs')}
            className="btn-secondary text-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-lg"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Saving...' : 'Save to Arsenal'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}