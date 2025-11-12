import { useState, useEffect } from 'react'
import { Save, Download, Trash2, Undo, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'

const GuitarTabEditor = ({ songId, onSave, embedded = false, initialTabData = null }) => {
  const [tab, setTab] = useState({
    chords: [], // Chord names above the tab
    lines: [
      { string: 'e', notes: [] }, // High E
      { string: 'B', notes: [] },
      { string: 'G', notes: [] },
      { string: 'D', notes: [] },
      { string: 'A', notes: [] },
      { string: 'E', notes: [] }  // Low E
    ]
  })
  const [currentPosition, setCurrentPosition] = useState(0)
  const [tabLength, setTabLength] = useState(20)
  const [selectedTechnique, setSelectedTechnique] = useState('normal')
  const [pendingTechnique, setPendingTechnique] = useState(null) // Stores technique waiting for target note

  const strings = ['e', 'B', 'G', 'D', 'A', 'E']
  const frets = Array.from({ length: 16 }, (_, i) => i)
  
  const techniques = [
    { value: 'normal', symbol: '', label: 'Normal', desc: 'Regular note' },
    { value: 'slide', symbol: '/', label: 'Slide Up', desc: 'Slide up (3/5)' },
    { value: 'slideDown', symbol: '\\', label: 'Slide Down', desc: 'Slide down (5\\3)' },
    { value: 'hammerOn', symbol: 'h', label: 'Hammer-On', desc: 'Hammer-on (3h5)' },
    { value: 'pullOff', symbol: 'p', label: 'Pull-Off', desc: 'Pull-off (5p3)' },
    { value: 'bend', symbol: '^', label: 'Bend', desc: 'Bend (3^)' },
    { value: 'release', symbol: 'r', label: 'Release', desc: 'Bend release (3^r)' },
    { value: 'vibrato', symbol: '~', label: 'Vibrato', desc: 'Vibrato (3~)' },
    { value: 'mute', symbol: 'x', label: 'Mute', desc: 'Muted note (x)' },
    { value: 'harmonic', symbol: '<>', label: 'Harmonic', desc: 'Natural harmonic (<5>)' }
  ]

  // Load initial data
  useEffect(() => {
    if (initialTabData) {
      setTab(initialTabData.tab || tab)
      setCurrentPosition(initialTabData.currentPosition || 0)
      setTabLength(initialTabData.tabLength || 20)
      setSelectedTechnique(initialTabData.selectedTechnique || 'normal')
      setPendingTechnique(initialTabData.pendingTechnique || null)
    }
  }, [initialTabData])

  // Auto-save when embedded
  useEffect(() => {
    if (embedded) {
      const timeoutId = setTimeout(() => {
        if (onSave) {
          onSave({ tab, currentPosition, tabLength, selectedTechnique, pendingTechnique })
        }
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [tab, currentPosition, tabLength, selectedTechnique, pendingTechnique, embedded, onSave])

  const addNote = (stringIndex, fret) => {
    setTab(prev => {
      const newTab = { ...prev }
      const line = newTab.lines[stringIndex]
      
      // Extend arrays if needed
      while (line.notes.length <= currentPosition) {
        line.notes.push('-')
      }
      while (newTab.chords.length <= currentPosition) {
        newTab.chords.push('')
      }
      
      // Check if we're completing a pending technique
      if (pendingTechnique && pendingTechnique.stringIndex === stringIndex) {
        // Complete the technique by updating the previous position
        const prevPos = pendingTechnique.position
        const prevNote = line.notes[prevPos]
        const fromFret = pendingTechnique.fromFret
        const symbol = pendingTechnique.symbol
        
        // Update the previous position with the complete technique
        line.notes[prevPos] = `${fromFret}${symbol}${fret}`
        
        // Add the target note at current position (normal note)
        line.notes[currentPosition] = fret === 0 ? '0' : fret.toString()
        
        // Clear pending technique
        setPendingTechnique(null)
        
        return newTab
      }
      
      // Handle new technique
      const technique = techniques.find(t => t.value === selectedTechnique)
      let noteText = ''
      
      if (selectedTechnique === 'mute') {
        noteText = 'x'
      } else if (selectedTechnique === 'harmonic') {
        noteText = `<${fret}>`
      } else if (selectedTechnique === 'normal') {
        noteText = fret === 0 ? '0' : fret.toString()
      } else if (['slide', 'slideDown', 'hammerOn', 'pullOff'].includes(selectedTechnique)) {
        // For techniques that need two notes, add symbol and wait for target
        noteText = `${fret}${technique.symbol}`
        
        // Set pending technique to wait for next note
        setPendingTechnique({
          stringIndex,
          position: currentPosition,
          fromFret: fret,
          symbol: technique.symbol
        })
        
        line.notes[currentPosition] = noteText
        return newTab
      } else {
        // Single note techniques (bend, vibrato, etc.)
        noteText = `${fret}${technique.symbol}`
      }
      
      line.notes[currentPosition] = noteText
      return newTab
    })
  }

  const removeNote = (stringIndex, position) => {
    setTab(prev => {
      const newTab = { ...prev }
      if (newTab.lines[stringIndex].notes[position]) {
        newTab.lines[stringIndex].notes[position] = '-'
      }
      return newTab
    })
  }

  const addChord = (chordName) => {
    if (!chordName.trim()) return
    
    setTab(prev => {
      const newTab = { ...prev }
      while (newTab.chords.length <= currentPosition) {
        newTab.chords.push('')
      }
      newTab.chords[currentPosition] = chordName.trim()
      return newTab
    })
  }

  const movePosition = (direction) => {
    // Clear pending technique when manually moving position
    setPendingTechnique(null)
    
    if (direction === 'left' && currentPosition > 0) {
      setCurrentPosition(currentPosition - 1)
    } else if (direction === 'right') {
      setCurrentPosition(currentPosition + 1)
      if (currentPosition + 1 >= tabLength) {
        setTabLength(tabLength + 10)
      }
    }
  }

  const extendTab = () => {
    setTabLength(tabLength + 10)
  }

  const clearPosition = () => {
    setPendingTechnique(null)
    
    setTab(prev => {
      const newTab = { ...prev }
      newTab.lines.forEach(line => {
        if (line.notes[currentPosition]) {
          line.notes[currentPosition] = '-'
        }
      })
      if (newTab.chords[currentPosition]) {
        newTab.chords[currentPosition] = ''
      }
      return newTab
    })
  }

  const clearAll = () => {
    if (window.confirm('Clear entire tab?')) {
      setPendingTechnique(null)
      setTab({
        chords: [],
        lines: [
          { string: 'e', notes: [] },
          { string: 'B', notes: [] },
          { string: 'G', notes: [] },
          { string: 'D', notes: [] },
          { string: 'A', notes: [] },
          { string: 'E', notes: [] }
        ]
      })
      setCurrentPosition(0)
    }
  }

  const exportTab = () => {
    const positionWidths = getPositionWidths()
    const maxLength = Math.max(
      tabLength,
      ...tab.lines.map(line => line.notes.length),
      tab.chords.length
    )
    
    // Build chord line with proper spacing
    const chordLine = Array.from({ length: maxLength }, (_, i) => {
      const chord = tab.chords[i] || ''
      const width = positionWidths[i] || 1
      return chord.padEnd(width)
    }).join('')
    
    // Build tab lines with proper spacing
    const tabText = tab.lines.map(line => {
      const notes = Array.from({ length: maxLength }, (_, i) => {
        const note = line.notes[i] || '-'
        const width = positionWidths[i] || 1
        return note.padEnd(width)
      })
      return `${line.string}|${notes.join('')}|`
    }).join('\n')

    const fullTab = `${chordLine}\n${tabText}`

    const element = document.createElement('a')
    const file = new Blob([fullTab], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `song_${songId || 'untitled'}_tabs.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const saveTab = () => {
    if (onSave) {
      onSave({ tab, currentPosition, tabLength, selectedTechnique, pendingTechnique })
    }
  }

  // Function to get the display width of a note/technique
  const getNoteDisplayWidth = (note) => {
    if (!note || note === '-') return 1
    return Math.max(1, note.length)
  }

  // Function to get the maximum width needed for each position across all strings
  const getPositionWidths = () => {
    const widths = []
    const maxLength = Math.max(
      tabLength,
      ...tab.lines.map(line => line.notes.length),
      tab.chords.length
    )
    
    for (let pos = 0; pos < maxLength; pos++) {
      let maxWidth = 1
      // Check all strings for this position
      tab.lines.forEach(line => {
        const note = line.notes[pos] || '-'
        maxWidth = Math.max(maxWidth, getNoteDisplayWidth(note))
      })
      // Also check chord name width
      const chord = tab.chords[pos] || ''
      maxWidth = Math.max(maxWidth, chord.length || 1)
      
      widths[pos] = maxWidth
    }
    
    return widths
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      {/* Header */}
      {!embedded ? (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-100">🎸 Guitar Tab Editor</h3>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={clearPosition}
              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              title="Clear current position"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={extendTab}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              title="Extend tab"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={saveTab}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={exportTab}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-400">
            Position: {currentPosition + 1} • Click frets to add notes
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={clearPosition}
              className="px-2 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={exportTab}
              className="px-2 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      )}

      {/* Position Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          type="button"
          onClick={() => movePosition('left')}
          disabled={currentPosition === 0}
          className="p-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Position:</span>
          <input
            type="number"
            value={currentPosition + 1}
            onChange={(e) => setCurrentPosition(Math.max(0, parseInt(e.target.value) - 1 || 0))}
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100 text-center"
            min="1"
          />
        </div>

        <button
          type="button"
          onClick={() => movePosition('right')}
          className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Technique Selector */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-bold text-gray-300">Playing Technique:</label>
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-100 min-w-40"
          >
            {techniques.map(technique => (
              <option key={technique.value} value={technique.value}>
                {technique.label} - {technique.desc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chord Input */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-gray-300 text-sm">Add Chord:</label>
          <input
            type="text"
            placeholder="G, Am, D7, etc."
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-gray-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault
                e.eventPreventDefault()
                addChord(e.target.value)
                e.target.value = ''
              }
            }}
          />
          <span className="text-gray-400 text-sm">(Press Enter to add)</span>
        </div>
      </div>

      {/* Fretboard */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-400 mb-3">
          Click fret numbers to add notes at position {currentPosition + 1} with technique: 
          <span className="text-blue-400 ml-1 font-medium">
            {techniques.find(t => t.value === selectedTechnique)?.label}
          </span>
          {pendingTechnique && (
            <span className="text-yellow-400 ml-2 font-medium">
              → Waiting for target note on {strings[pendingTechnique.stringIndex]} string
            </span>
          )}
        </div>
        
        {strings.map((string, stringIndex) => (
          <div key={stringIndex} className="flex items-center mb-2">
            <div className={`w-8 text-right pr-2 font-bold ${
              pendingTechnique && pendingTechnique.stringIndex === stringIndex 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            }`}>
              {string}
              {pendingTechnique && pendingTechnique.stringIndex === stringIndex && (
                <span className="text-xs ml-1">→</span>
              )}
            </div>
            <div className="flex space-x-1">
              {frets.map(fret => (
                <button
                  key={fret}
                  type="button"
                  onClick={() => addNote(stringIndex, fret)}
                  className="w-8 h-8 bg-gray-700 hover:bg-blue-600 border border-gray-600 hover:border-blue-500 rounded text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  {fret}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Display */}
      <div className="bg-black rounded-lg p-4 border border-gray-700">
        <div className="text-sm text-green-400 mb-2">Your Tab:</div>
        <div className="font-mono text-xs overflow-x-auto">
          {(() => {
            const positionWidths = getPositionWidths()
            const maxLength = Math.max(
              tabLength,
              ...tab.lines.map(line => line.notes.length),
              tab.chords.length
            )
            
            return (
              <>
                {/* Chord names */}
                <div className="text-blue-400 mb-1 whitespace-pre">
                  {' '.repeat(2)}
                  {Array.from({ length: maxLength }, (_, i) => {
                    const chord = tab.chords[i] || ''
                    const width = positionWidths[i] || 1
                    const isCurrentPos = i === currentPosition
                    const displayChord = chord.padEnd(width)
                    
                    return (
                      <span key={i} className={`${isCurrentPos ? 'bg-blue-600 text-white' : ''}`}>
                        {displayChord}
                      </span>
                    )
                  })}
                </div>
                
                {/* Tab lines */}
                {tab.lines.map((line, stringIndex) => (
                  <div key={stringIndex} className="text-green-400 whitespace-pre">
                    {line.string}|
                    {Array.from({ length: maxLength }, (_, i) => {
                      const note = line.notes[i] || '-'
                      const width = positionWidths[i] || 1
                      const isCurrentPos = i === currentPosition
                      
                      // Pad the note to match the required width for this position
                      const paddedNote = note.padEnd(width)
                      
                      // Color code based on technique
                      let noteClass = 'text-green-400'
                      if (note.includes('/') || note.includes('\\')) noteClass = 'text-blue-400' // slides
                      if (note.includes('h') || note.includes('p')) noteClass = 'text-yellow-400' // hammer/pull
                      if (note.includes('^') || note.includes('~')) noteClass = 'text-red-400' // bends/vibrato
                      if (note.includes('<') || note === 'x') noteClass = 'text-purple-400' // harmonics/mutes
                      
                      return (
                        <span 
                          key={i} 
                          className={`${isCurrentPos ? 'bg-blue-600 text-white' : noteClass}`}
                          onClick={() => removeNote(stringIndex, i)}
                          style={{ cursor: 'pointer' }}
                          title="Click to remove note"
                        >
                          {paddedNote}
                        </span>
                      )
                    })}
                    |
                  </div>
                ))}
              </>
            )
          })()}
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Click on notes in the tab to remove them • Current position highlighted in blue<br/>
          <span className="text-blue-400">Slides</span> • 
          <span className="text-yellow-400 ml-2">Hammer-ons/Pull-offs</span> • 
          <span className="text-red-400 ml-2">Bends/Vibrato</span> • 
          <span className="text-purple-400 ml-2">Harmonics/Mutes</span> • 
          <span className="text-green-400 ml-2">Normal</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>• <strong>Select technique</strong> first, then click frets to add notes</p>
        <p>• <strong>Slides/Hammer-ons/Pull-offs:</strong> Click starting fret, then click target fret on same string</p>
        <p>• <strong>Positioning:</strong> Techniques stay aligned - target notes appear at next position</p>
        <p>• <strong>Chord names:</strong> Type and press Enter to add above tab</p>
        <p>• <strong>Click notes</strong> in the tab display to remove them</p>
        <p>• <strong>Multiple notes</strong> at same position for chords</p>
      </div>
    </div>
  )
}

export default GuitarTabEditor