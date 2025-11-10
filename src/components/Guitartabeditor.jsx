import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Save, Download, Upload, Trash2 } from 'lucide-react'

const GuitarTabEditor = ({ songId, onSave, embedded = false, initialTabData = null }) => {
  const [measures, setMeasures] = useState(
    initialTabData || [{ id: 1, notes: [] }]
  )
  const [currentMeasure, setCurrentMeasure] = useState(0)
  const [selectedString, setSelectedString] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)

  const strings = [
    { name: 'E', tuning: 'E4', color: 'text-red-400' },
    { name: 'B', tuning: 'B3', color: 'text-orange-400' },
    { name: 'G', tuning: 'G3', color: 'text-yellow-400' },
    { name: 'D', tuning: 'D3', color: 'text-green-400' },
    { name: 'A', tuning: 'A2', color: 'text-blue-400' },
    { name: 'E', tuning: 'E2', color: 'text-purple-400' }
  ]

  const frets = Array.from({ length: 13 }, (_, i) => i)

  // Load initial tab data when component mounts or initialTabData changes
  useEffect(() => {
    if (initialTabData && Array.isArray(initialTabData)) {
      setMeasures(initialTabData)
    }
  }, [initialTabData])

  const addNote = (stringIndex, fret, beat = 0) => {
    setMeasures(prev => {
      const newMeasures = [...prev]
      const measure = newMeasures[currentMeasure]
      
      // Remove existing note on same string and beat
      measure.notes = measure.notes.filter(note => 
        !(note.string === stringIndex && note.beat === beat)
      )
      
      // Add new note
      measure.notes.push({
        id: Date.now(),
        string: stringIndex,
        fret,
        beat,
        duration: 4 // quarter note
      })
      
      return newMeasures
    })
  }

  const removeNote = (noteId) => {
    setMeasures(prev => {
      const newMeasures = [...prev]
      const measure = newMeasures[currentMeasure]
      measure.notes = measure.notes.filter(note => note.id !== noteId)
      return newMeasures
    })
  }

  const addMeasure = () => {
    setMeasures(prev => [...prev, { id: prev.length + 1, notes: [] }])
  }

  const exportTab = () => {
    const tabText = measures.map((measure, measureIndex) => {
      const lines = strings.map(() => Array(16).fill('-'))
      
      measure.notes.forEach(note => {
        const position = Math.floor(note.beat * 4)
        if (position < 16) {
          lines[note.string][position] = note.fret.toString().padStart(2, '-')[1]
        }
      })
      
      return lines.map((line, stringIndex) => 
        `${strings[stringIndex].name}|${line.join('')}|`
      ).join('\n')
    }).join('\n\n')

    const element = document.createElement('a')
    const file = new Blob([tabText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `song_${songId || 'untitled'}_tabs.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const saveTab = () => {
    if (onSave) {
      onSave(measures)
    }
  }

  // Auto-save when embedded and measures change
  useEffect(() => {
    if (embedded && measures.length > 0) {
      // Debounce the save to avoid too many updates
      const timeoutId = setTimeout(() => {
        saveTab()
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [measures, embedded])

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      {!embedded && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-100">🎸 Tab Editor</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-gray-400 text-sm">BPM:</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100"
                min="60"
                max="200"
              />
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={saveTab}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={exportTab}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            Auto-saves as you create tabs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTab}
              className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              Export
            </button>
            <div className="flex items-center space-x-2">
              <label className="text-gray-400 text-xs">BPM:</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                className="w-14 px-1 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-gray-100"
                min="60"
                max="200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Measure Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-gray-400">Measure:</span>
        <div className="flex space-x-2">
          {measures.map((measure, index) => (
            <button
              key={measure.id}
              onClick={() => setCurrentMeasure(index)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                currentMeasure === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={addMeasure}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* Interactive Fretboard */}
      <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Fret Numbers */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {frets.map(fret => (
              <div key={fret} className="w-12 text-center text-gray-400 text-sm">
                {fret === 0 ? 'Open' : fret}
              </div>
            ))}
          </div>

          {/* Strings and Frets */}
          {strings.map((string, stringIndex) => {
            const currentNotes = measures[currentMeasure]?.notes.filter(note => note.string === stringIndex) || []
            
            return (
              <div key={stringIndex} className="flex items-center mb-1">
                <div className={`w-12 text-right pr-2 font-bold ${string.color}`}>
                  {string.name}
                </div>
                {frets.map(fret => {
                  const hasNote = currentNotes.some(note => note.fret === fret)
                  
                  return (
                    <button
                      key={fret}
                      onClick={() => addNote(stringIndex, fret)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        const note = currentNotes.find(note => note.fret === fret)
                        if (note) removeNote(note.id)
                      }}
                      className={`w-12 h-8 border border-gray-600 relative transition-colors ${
                        hasNote
                          ? 'bg-red-500 border-red-400'
                          : 'hover:bg-gray-700'
                      } ${
                        selectedString === stringIndex ? 'ring-2 ring-blue-400' : ''
                      }`}
                    >
                      {hasNote && (
                        <span className="text-white font-bold">{fret}</span>
                      )}
                      {fret === 3 || fret === 5 || fret === 7 || fret === 9 || fret === 12 ? (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Text Preview */}
      <div className="mt-6">
        <h4 className="text-lg font-bold text-gray-100 mb-3">Tab Preview:</h4>
        <div className="bg-black p-4 rounded-lg border border-gray-700">
          <pre className="font-mono text-green-400 text-sm overflow-x-auto whitespace-pre">
            {measures[currentMeasure] && (() => {
              const lines = strings.map(() => Array(16).fill('-'))
              
              measures[currentMeasure].notes.forEach(note => {
                const position = Math.floor(note.beat * 4)
                if (position < 16) {
                  lines[note.string][position] = note.fret.toString()
                }
              })
              
              return lines.map((line, stringIndex) => 
                `${strings[stringIndex].name}|${line.join('')}|`
              ).join('\n')
            })()}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-400">
        <p>• Click on frets to add notes</p>
        <p>• Right-click to remove notes</p>
        <p>• Use measure navigation to create longer tabs</p>
        <p>• Export your tabs as text files</p>
      </div>
    </div>
  )
}

export default GuitarTabEditor