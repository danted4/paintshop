import './ModeToggle.css'

export function ModeToggle({ mode, onModeChange, canToggle = true }) {
  const modes = [
    { id: 'paint', label: 'Paint', icon: '🎨' },
    { id: 'photo', label: 'Photo Edit', icon: '🖼️' }
  ]

  return (
    <div className="mode-toggle">
      <div className="mode-buttons">
        {modes.map((modeOption) => (
          <button
            key={modeOption.id}
            className={`mode-btn ${mode === modeOption.id ? 'active' : ''}`}
            onClick={() => onModeChange(modeOption.id)}
            title={`Switch to ${modeOption.label} mode`}
          >
            <span className="mode-icon">{modeOption.icon}</span>
            <span className="mode-label">{modeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}