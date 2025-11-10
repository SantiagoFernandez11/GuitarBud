import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Save, AlertCircle, Music } from 'lucide-react'
import GuitarTabEditor from '../components/Guitarabeditor'

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
  const [editingTabs, setEditingTabs] = useState(false)

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

  // Function to render tabs in read-only format
  const renderTabDisplay = () => {
    const strings = ['e', 'B', 'G', 'D', 'A', 'E'] // Define strings for fallback
    
    if (!formData.tab_data?.tab?.lines) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>No tabs created yet.</p>
          <button
            type="button"
            onClick={() => setEditingTabs(true)}
            className="mt-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            Create your first tab →
          </button>
        </div>
      )
    }

    const { tab } = formData.tab_data
    
    // Find the actual length of content
    const maxLength = Math.max(
      ...tab.lines.map(line => line.notes ? line.notes.length : 0),
      tab.chords ? tab.chords.length : 0,
      10 // Minimum display length
    )
    
    // Calculate position widths for alignment
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
      <div className="bg-black rounded-lg p-4 border border-gray-700">
        <div className="font-mono text-xs overflow-x-auto">
          {/* Chord names */}
          {tab.chords && tab.chords.some(chord => chord && chord.trim()) && (
            <div className="text-blue-400 mb-1 whitespace-pre">
              {' '.repeat(2)}
              {Array.from({ length: maxLength }, (_, i) => {
                const chord = tab.chords[i] || ''
                const width = positionWidths[i] || 1
                return (typeof chord === 'string' ? chord : '').padEnd(width)
              }).join('')}
            </div>
          )}
          
          {/* Tab lines */}
          {tab.lines.map((line, stringIndex) => (
            <div key={stringIndex} className="whitespace-pre">
              <span className="text-gray-300">{line.string || strings[stringIndex]}</span>
              <span className="text-gray-400">|</span>
              {Array.from({ length: maxLength }, (_, i) => {
                const note = line.notes && line.notes[i] ? line.notes[i] : '-'
                const width = positionWidths[i] || 1
                const noteStr = typeof note === 'string' ? note : '-'
                const paddedNote = noteStr.padEnd(width)
                
                // Color code based on technique
                if (noteStr.includes('/') || noteStr.includes('\\')) {
                  return <span key={i} className="text-blue-400">{paddedNote}</span>
                }
                if (noteStr.includes('h') || noteStr.includes('p')) {
                  return <span key={i} className="text-yellow-400">{paddedNote}</span>
                }
                if (noteStr.includes('^') || noteStr.includes('~')) {
                  return <span key={i} className="text-red-400">{paddedNote}</span>
                }
                if (noteStr.includes('<') || noteStr === 'x') {
                  return <span key={i} className="text-purple-400">{paddedNote}</span>
                }
                return <span key={i} className="text-green-400">{paddedNote}</span>
              })}
              <span className="text-gray-400">|</span>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          <span className="text-blue-400">Slides</span> • 
          <span className="text-yellow-400 ml-2">Hammer-ons/Pull-offs</span> • 
          <span className="text-red-400 ml-2">Bends/Vibrato</span> • 
          <span className="text-purple-400 ml-2">Harmonics/Mutes</span> • 
          <span className="text-green-400 ml-2">Normal Notes</span>
        </div>
      </div>
    )
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

        {/* Guitar Tabs Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold text-gray-100">Guitar Tablature</h3>
              {formData.tab_data && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Created
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditingTabs(!editingTabs)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {editingTabs ? 'Done Editing' : 'Edit Tabs'}
            </button>
          </div>
          
          {editingTabs ? (
            <div>
              <p className="text-gray-400 mb-4">
                Create guitar tabs with techniques like slides, bends, and hammer-ons. 
                Select playing techniques from the dropdown and click frets to build your tab.
              </p>
              <GuitarTabEditor 
                songId={id}
                initialTabData={formData.tab_data}
                onSave={handleTabSave}
                embedded={true}
              />
            </div>
          ) : (
            <div>
              {renderTabDisplay()}
            </div>
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