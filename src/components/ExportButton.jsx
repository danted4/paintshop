import { useState } from 'preact/hooks'
import './ExportButton.css'

export function ExportButton({ canvas, filename = 'paintshop-image' }) {
  const [isExporting, setIsExporting] = useState(false)
  const [showFormats, setShowFormats] = useState(false)

  const exportImage = async (format = 'png', quality = 1.0) => {
    if (!canvas) return

    setIsExporting(true)
    
    try {
      // Create a new canvas with white background for JPEG
      const exportCanvas = document.createElement('canvas')
      const exportCtx = exportCanvas.getContext('2d')
      
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height
      
      // Fill with white background for JPEG
      if (format === 'jpeg') {
        exportCtx.fillStyle = '#FFFFFF'
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
      }
      
      exportCtx.drawImage(canvas, 0, 0)
      
      // Convert to blob
      exportCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${filename}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        setIsExporting(false)
        setShowFormats(false)
      }, `image/${format}`, quality)
      
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
    }
  }

  const toggleFormats = () => {
    if (!canvas) return
    setShowFormats(!showFormats)
  }

  if (!canvas) {
    return (
      <button className="icon-btn" disabled>
        💾
        <div className="tooltip">No image to export</div>
      </button>
    )
  }

  return (
    <div className="export-container">
      <button 
        className="icon-btn"
        onClick={toggleFormats}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="spinner-small"></span>
        ) : (
          <>💾</>
        )}
        <div className="tooltip">Export Image</div>
      </button>
      
      {showFormats && (
        <div className="export-formats">
          <div className="formats-header">
            <h3>Choose Format</h3>
            <button 
              className="close-btn"
              onClick={() => setShowFormats(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="format-options">
            <button 
              className="format-btn"
              onClick={() => exportImage('png')}
              title="Best for images with transparency"
            >
              <span className="format-icon">🖼️</span>
              <div className="format-info">
                <strong>PNG</strong>
                <small>Lossless, supports transparency</small>
              </div>
            </button>
            
            <button 
              className="format-btn"
              onClick={() => exportImage('jpeg', 0.9)}
              title="Smaller file size, good for photos"
            >
              <span className="format-icon">📷</span>
              <div className="format-info">
                <strong>JPEG</strong>
                <small>Smaller size, good for photos</small>
              </div>
            </button>
            
            <button 
              className="format-btn"
              onClick={() => exportImage('webp', 0.9)}
              title="Modern format, best compression"
            >
              <span className="format-icon">🚀</span>
              <div className="format-info">
                <strong>WebP</strong>
                <small>Modern format, best compression</small>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}