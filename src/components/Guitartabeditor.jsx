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
  const [selectedTechnique, setSelectedTechnique] = useState('normal')
  const [pendingTechnique, setPendingTechnique] = useState(null)
  const [tabLength, setTabLength] = useState(32)
  const [isDirty, setIsDirty] = useState(false)

  const techniques = [
    { value: 'normal', symbol: '', label: 'Normal', desc: 'Standard note' },
    { value: 'slideUp', symbol: '/', label: 'Slide Up', desc: 'Slide up (3/5)' },
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
      setSelectedTechnique(initialTabData.selectedTechnique || 'normal')
      setTabLength(initialTabData.tabLength || 32)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTabData])

  // Mark dirty when tab changes
  useEffect(() => {
    setIsDirty(true)
  }, [tab])

  // Auto-save for embedded mode
  useEffect(() => {
    if (embedded && onSave && isDirty) {
      const timeoutId = setTimeout(() => {
        onSave({
          tab,
          currentPosition,
          selectedTechnique,
          tabLength
        })
        setIsDirty(false)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [tab, currentPosition, tabLength, selectedTechnique, embedded, onSave, isDirty])

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
      if (pendingTechnique) {
        const { stringIndex: fromString, position: fromPos, fret: fromFret, technique } = pendingTechnique

        // Only allow technique completion on same string
        if (fromString !== stringIndex) {
          setPendingTechnique(null)
          return prev
        }

        // Ensure both positions exist
        while (line.notes.length <= fromPos) {
          line.notes.push('-')
        }

        // Create technique notation
        const fromNote = fromFret === 0 ? '0' : fromFret.toString()
        const toNote = fret === 0 ? '0' : fret.toString()
        const symbol = technique.symbol

        // Place notation at from position
        line.notes[fromPos] = fromNote + symbol + toNote

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
      } else if (['slideUp', 'slideDown', 'hammerOn', 'pullOff'].includes(selectedTechnique)) {
        // These techniques need a second note
        setPendingTechnique({
          stringIndex,
          position: currentPosition,
          fret,
          technique
        })
        noteText = fret === 0 ? '0' : fret.toString()
      } else if (selectedTechnique === 'bend') {
        noteText = (fret === 0 ? '0' : fret.toString()) + '^'
      } else if (selectedTechnique === 'release') {
        noteText = (fret === 0 ? '0' : fret.toString()) + '^r'
      } else if (selectedTechnique === 'vibrato') {
        noteText = (fret === 0 ? '0' : fret.toString()) + '~'
      }

      line.notes[currentPosition] = noteText

      // Auto-advance position
      if (currentPosition < tabLength - 1) {
        setCurrentPosition(prevPos => prevPos + 1)
      }

      return newTab
    })
  }

  const removeNote = (stringIndex, position) => {
    setTab(prev => {
      const newTab = { ...prev }
      const line = newTab.lines[stringIndex]
      if (line.notes[position] !== undefined) {
        line.notes[position] = '-'
      }
      return newTab
    })
  }

  const addChord = (position, chordName) => {
    setTab(prev => {
      const newTab = { ...prev }
      while (newTab.chords.length <= position) {
        newTab.chords.push('')
      }
      newTab.chords[position] = chordName
      return newTab
    })
  }

  const clearPosition = () => {
    setTab(prev => {
      const newTab = { ...prev }
      newTab.lines.forEach(line => {
        if (line.notes[currentPosition] !== undefined) {
          line.notes[currentPosition] = '-'
        }
      })
      if (newTab.chords[currentPosition] !== undefined) {
        newTab.chords[currentPosition] = ''
      }
      return newTab
    })
    setPendingTechnique(null)
  }

  const clearAll = () => {
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
    setPendingTechnique(null)
  }

  const extendTab = () => {
    setTabLength(prev => prev + 16)
  }

  const saveTab = () => {
    if (onSave) {
      onSave({
        tab,
        currentPosition,
        selectedTechnique,
        tabLength
      })
      setIsDirty(false)
    }
  }

  const exportTab = () => {
    // Generate tab text
    let tabText = ''

    // Add chords line
    const chordLine = tab.chords.map(chord => (chord || '').padEnd(3, ' ')).join('')
    tabText += `   ${chordLine}\n`

    // Add each string line
    tab.lines.forEach(line => {
      const noteLine = []
      for (let i = 0; i < tabLength; i++) {
        const note = line.notes[i] || '-'
        // Handle multi-character notes (like 10, 3h5, etc.)
        if (note.length > 1) {
          noteLine.push(note.padEnd(3, '-'))
        } else {
          noteLine.push(note.padEnd(3, '-'))
        }
      }
      tabText += `${line.string}|${noteLine.join('')}|\n`
    })

    // Download as text file
    const blob = new Blob([tabText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tab-${songId || 'export'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const movePosition = (direction) => {
    setPendingTechnique(null)
    setCurrentPosition(prev => {
      const newPos = prev + direction
      return Math.max(0, Math.min(tabLength - 1, newPos))
    })
  }

  // Generate fret numbers (0-12)
  const frets = Array.from({ length: 13 }, (_, i) => i)

  // Calculate display widths for proper alignment
  const getNoteWidth = (note) => {
    return Math.max(1, note.toString().length)
  }

  const getMaxWidths = () => {
    const widths = Array(tabLength).fill(1)

    tab.lines.forEach(line => {
      line.notes.forEach((note, pos) => {
        if (note && note !== '-') {
          widths[pos] = Math.max(widths[pos], getNoteWidth(note))
        }
      })
    })

    tab.chords.forEach((chord, pos) => {
      if (chord) {
        widths[pos] = Math.max(widths[pos], chord.length)
      }
    })

    return widths
  }

  return (
    <div className="card">
      {/* Header */}
      {!embedded ? (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">🎸 Guitar Tab Editor</h3>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={clearPosition}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Clear current position"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={extendTab}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Extend tab"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={saveTab}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Save"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={exportTab}
              className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Position: {currentPosition + 1} • Click frets to add notes
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={exportTab}
              className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
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
          onClick={() => movePosition(-1)}
          disabled={currentPosition === 0}
          className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="Previous position"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Position</span>
          <input
            type="number"
            value={currentPosition + 1}
            onChange={(e) => {
              const pos = parseInt(e.target.value) - 1
              if (!isNaN(pos)) {
                setCurrentPosition(Math.max(0, Math.min(tabLength - 1, pos)))
                setPendingTechnique(null)
              }
            }}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-gray-900 text-center focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            min="1"
            max={tabLength}
          />
          <span className="text-sm text-gray-500">/ {tabLength}</span>
        </div>

        <button
          type="button"
          onClick={() => movePosition(1)}
          disabled={currentPosition === tabLength - 1}
          className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="Next position"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Technique Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Technique</label>
          <select
            value={selectedTechnique}
            onChange={(e) => {
              setSelectedTechnique(e.target.value)
              setPendingTechnique(null)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 min-w-40 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          >
            {techniques.map(technique => (
              <option key={technique.value} value={technique.value}>
                {technique.label} {technique.symbol ? `(${technique.symbol})` : ''}
              </option>
            ))}
          </select>
        </div>

        {pendingTechnique && (
          <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 px-3 py-2 rounded-md">
            <Undo className="h-4 w-4" />
            <span>Select destination note to complete technique</span>
            <button
              type="button"
              onClick={() => setPendingTechnique(null)}
              className="text-gray-900 hover:underline font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Chord Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Chords</label>
          <div className="text-xs text-gray-500">
            Enter chord name for current position
          </div>
        </div>
        <input
          type="text"
          value={tab.chords[currentPosition] || ''}
          onChange={(e) => addChord(currentPosition, e.target.value)}
          placeholder="e.g., Am, C, G7"
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              movePosition(1)
            }
          }}
        />
      </div>

      {/* Fretboard */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Fretboard</h4>
          <div className="text-xs text-gray-500">Click a fret to add note</div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Fret numbers */}
            <div className="flex items-center mb-2">
              <div className="w-10"></div>
              {frets.map(fret => (
                <div key={fret} className="w-8 text-center text-xs text-gray-500 font-medium">
                  {fret}
                </div>
              ))}
            </div>

            {/* String rows */}
            {tab.lines.map((line, stringIndex) => (
              <div key={line.string} className="flex items-center mb-1">
                <div className="w-10 text-sm font-semibold text-gray-800 text-center">
                  {line.string}
                </div>
                {frets.map(fret => (
                  <button
                    key={fret}
                    type="button"
                    onClick={() => addNote(stringIndex, fret)}
                    className="w-8 h-8 bg-white hover:bg-gray-900 border border-gray-300 hover:border-gray-900 rounded-md text-gray-700 hover:text-white text-sm font-medium transition-colors"
                    title={`String ${line.string}, Fret ${fret}`}
                  >
                    {fret}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Display */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-200">Tab Preview</h4>
          <div className="text-xs text-gray-400">
            Click notes to remove • Current position highlighted
          </div>
        </div>

        <div className="font-mono text-sm overflow-x-auto">
          {(() => {
            const widths = getMaxWidths()

            // Chords line
            const chordLine = []
            for (let i = 0; i < tabLength; i++) {
              const chord = tab.chords[i] || ''
              const width = widths[i]
              const isCurrentPos = i === currentPosition
              const displayChord = chord.padEnd(width + 2, ' ')
              chordLine.push(
                <span key={i} className={`${isCurrentPos ? 'bg-gray-700 text-white' : ''}`}>
                  {displayChord}
                </span>
              )
            }

            return (
              <>
                <div className="text-gray-200 mb-1">
                  <span className="w-6 inline-block"></span>
                  {chordLine}
                </div>

                {/* String lines */}
                {tab.lines.map((line, stringIndex) => {
                  const noteLine = []
                  for (let i = 0; i < tabLength; i++) {
                    const note = line.notes[i] || '-'
                    const width = widths[i]
                    const isCurrentPos = i === currentPosition

                    let displayNote = note.toString()
                    if (displayNote.length < width + 2) {
                      displayNote = displayNote.padEnd(width + 2, '-')
                    }

                    const noteClass = note !== '-' ? 'text-gray-100' : 'text-gray-500'

                    noteLine.push(
                      <button
                        key={i}
                        type="button"
                        className={`${isCurrentPos ? 'bg-gray-700 text-white' : noteClass}`}
                        onClick={() => removeNote(stringIndex, i)}
                        title="Click to remove note"
                      >
                        {displayNote}
                      </button>
                    )
                  }

                  return (
                    <div key={line.string} className="text-gray-200 mb-1">
                      <span className="w-6 inline-block font-semibold">{line.string}|</span>
                      {noteLine}
                      <span className="font-semibold">|</span>
                    </div>
                  )
                })}
              </>
            )
          })()}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2 font-medium">Techniques</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {techniques
              .filter(t => t.value !== 'normal')
              .map(technique => (
                <div key={technique.value} className="text-gray-300">
                  <span className="font-mono font-semibold text-gray-100">
                    {technique.symbol}
                  </span>{' '}
                  {technique.label}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Embedded Save Hint */}
      {embedded && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Changes are saved automatically
        </div>
      )}
    </div>
  )
}

export default GuitarTabEditor
