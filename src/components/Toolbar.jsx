import './Toolbar.css'

export function Toolbar({
  tool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  color,
  onColorChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  tools
}) {
  const toolIcons = {
    brush: '🖌️',
    pencil: '✏️',
    eraser: '🧽',
    fill: '🪣',
    rectangle: '⬜',
    ellipse: '⭕',
    line: '📏',
    text: '📝'
  }

  const toolNames = {
    brush: 'Brush',
    pencil: 'Pencil',
    eraser: 'Eraser',
    fill: 'Fill',
    rectangle: 'Rectangle',
    ellipse: 'Ellipse',
    line: 'Line',
    text: 'Text'
  }

  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
  ]

  return (
    <div className="toolbar-sidebar">
      <div className="tool-grid">
        {Object.entries(tools).map(([key, value]) => (
          <button
            key={key}
            className={`tool-btn ${tool === value ? 'active' : ''}`}
            onClick={() => onToolChange(value)}
            title={toolNames[value]}
          >
            {toolIcons[value]}
          </button>
        ))}
      </div>

      <div className="control-section">
        <label className="control-label">
          Size: {brushSize}px
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          className="size-slider"
        />
      </div>

      <div className="control-section">
        <label className="control-label">Color</label>
        <div className="color-section">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-picker"
            title="Custom color"
          />
          <div className="color-presets">
            {predefinedColors.map((presetColor) => (
              <button
                key={presetColor}
                className={`color-preset ${color === presetColor ? 'active' : ''}`}
                style={{ backgroundColor: presetColor }}
                onClick={() => onColorChange(presetColor)}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="control-section">
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶ Undo
          </button>
          <button
            className="action-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷ Redo
          </button>
          <button
            className="action-btn clear-btn"
            onClick={onClear}
            title="Clear canvas"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  )
}