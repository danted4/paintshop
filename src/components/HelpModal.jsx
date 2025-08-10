import './HelpModal.css'

export function HelpModal({ onClose }) {
  const shortcuts = [
    { key: 'Ctrl/Cmd + N', action: 'New Canvas' },
    { key: 'Ctrl/Cmd + O', action: 'Load Image' },
    { key: 'Ctrl/Cmd + S', action: 'Export Canvas' },
    { key: 'Ctrl/Cmd + Z', action: 'Undo (in canvas)' },
    { key: 'Ctrl/Cmd + Y', action: 'Redo (in canvas)' },
    { key: 'Escape', action: 'Close modals' },
    { key: '1-8', action: 'Select paint tools' },
    { key: '[/]', action: 'Decrease/Increase brush size' }
  ]

  return (
    <div className="help-modal">
      <div className="help-content">
        <div className="help-header">
          <h2>PaintShop Help</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-body">
          <section className="help-section">
            <h3>Getting Started</h3>
            <ul>
              <li>Start drawing immediately on the blank canvas</li>
              <li>Load an image to edit or draw over it</li>
              <li>Switch between Paint and Photo Edit modes</li>
              <li>Export your work when finished</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Paint Mode</h3>
            <ul>
              <li>Use various tools: brush, pencil, eraser, shapes</li>
              <li>Adjust brush size and color</li>
              <li>Fill areas with the bucket tool</li>
              <li>Undo/redo your actions</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Photo Edit Mode</h3>
            <ul>
              <li>Adjust brightness, contrast, saturation</li>
              <li>Apply blur and hue rotation effects</li>
              <li>Rotate and scale images</li>
              <li>Crop images by dragging on canvas</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd>{shortcut.key}</kbd>
                  <span>{shortcut.action}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="help-footer">
          <button className="close-btn-primary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}