import { useState } from 'preact/hooks'
import './CanvasSettings.css'

export function CanvasSettings({ onCreateCanvas, onCancel, currentSize }) {
  const [width, setWidth] = useState(currentSize.width)
  const [height, setHeight] = useState(currentSize.height)

  const presets = [
    { name: 'Small (400×300)', width: 400, height: 300 },
    { name: 'Medium (800×600)', width: 800, height: 600 },
    { name: 'Large (1200×800)', width: 1200, height: 800 },
    { name: 'HD (1920×1080)', width: 1920, height: 1080 },
    { name: 'Square Small (400×400)', width: 400, height: 400 },
    { name: 'Square Large (800×800)', width: 800, height: 800 },
    { name: 'Portrait (600×800)', width: 600, height: 800 },
    { name: 'Landscape (1000×600)', width: 1000, height: 600 }
  ]

  const handlePresetSelect = (preset) => {
    setWidth(preset.width)
    setHeight(preset.height)
  }

  const handleCreate = () => {
    if (width > 0 && height > 0 && width <= 4000 && height <= 4000) {
      onCreateCanvas({ width: parseInt(width), height: parseInt(height) })
    }
  }

  return (
    <div className="canvas-settings">
      <div className="settings-header">
        <h2>New Canvas</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="settings-content">
        <div className="presets-section">
          <h3>Presets</h3>
          <div className="presets-grid">
            {presets.map((preset, index) => (
              <button
                key={index}
                className={`preset-btn ${width === preset.width && height === preset.height ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-section">
          <h3>Custom Size</h3>
          <div className="size-inputs">
            <div className="input-group">
              <label>Width (px)</label>
              <input
                type="number"
                min="1"
                max="4000"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height (px)</label>
              <input
                type="number"
                min="1"
                max="4000"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>
          <p className="size-info">
            Canvas size: {width} × {height} pixels
            {(width > 2000 || height > 2000) && (
              <span className="warning"> (Large canvas may affect performance)</span>
            )}
          </p>
        </div>

        <div className="settings-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="create-btn" 
            onClick={handleCreate}
            disabled={!width || !height || width <= 0 || height <= 0 || width > 4000 || height > 4000}
          >
            Create Canvas
          </button>
        </div>
      </div>
    </div>
  )
}